import React, { useEffect, useState } from 'react';
import { Form, Button, Typography } from 'antd';
// import { useSendSMSMutation, useVerifySMSMutation } from '../api/smsApi';
import { showNotification } from '../hooks/showNotification';
import { useNavigate } from 'react-router-dom';
import SmsCodeInput from '../components/SMSCodeInput';
import { useAppSelector } from '../hooks/redux';
import useValidatePaymentLink from '../hooks/validateLink';
import { useSendSMSMutation, useVerifySMSMutation } from '../api/smsApi';


const { Title } = Typography;

const PhoneVerificationForm: React.FC = () => {
  const token = localStorage.getItem("access_token")
  const { user, isLoggedIn } = useAppSelector(state => state.userReducer)
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [sendSMS] = useSendSMSMutation();
  const [verifySMS] = useVerifySMSMutation();

  const linkId = useAppSelector(state => state.courseReducer.paymentLink)

  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(0); // Timer for resend button
  const [clearError, setClearError] = useState(false);

  const { isValid, component } = useValidatePaymentLink(linkId);

  // Timer logic for the resend button
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (codeSent) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            setCodeSent(false); // Enable resend
            clearInterval(interval!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [codeSent]);

  // Function to handle sending a new code
  const sendNewCode = async () => {
    setCodeSent(true);
    setTimer(60);

    try {
      await sendSMS({ phone: user.phone }).unwrap();
      showNotification('success', "Код отправлен на номер " + user.phone);
    } catch (e: any) {
      setClearError(true)
      showNotification('error', e.data?.message || 'Ошибка при отправке SMS');
    }
  };

  // Function to handle form submission (code verification)
  const onFinish = async (values: { code: string }) => {
    console.log('Код для проверки:', values.code);
    try {
      await verifySMS({ code: values.code, phone: user.phone }).unwrap();
      if (isLoggedIn && token) {
        navigate('/payment')
      } else {
        navigate('/set-password')
      }
    } catch (e: any) {
      showNotification('error', e.data?.message || 'Ошибка верификации SMS');
      // setClearError(true); // Clear the input
      // setTimeout(() => setClearError(false), 0); // Reset clearError state
    }
  };

  // Function to handle SMS Code Input completion
  const handleComplete = (code: string) => {
    form.setFieldsValue({ code });
    form.submit(); // Automatically submit the form
  };

  return (
    <>
    {
      !isValid ? component : (
    <div className="flex justify-center items-center min-h-screen w-full px-4 py-5">
      <div className="max-w-xl mx-auto p-10 bg-white shadow-md rounded-2xl">
        <Title className='font-rubik' level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
          Проверка телефона
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ code: '' }}
        >
          {/* Code Input */}
          <Form.Item
            name="code"
            label="Введите код из SMS"
            rules={[
              { required: true, message: 'Пожалуйста, введите код' },
            ]}
          >
            <SmsCodeInput length={5} onComplete={handleComplete} clearError={clearError} />
          </Form.Item>
          
          <Form.Item>
            <p className='w-full text-center text-gray-600'>Код отправлен на номер {user.phone}</p>
          </Form.Item>

          {/* Resend Code Button and Timer */}
          <Form.Item>
            <Button
              type="link"
              disabled={codeSent}
              onClick={sendNewCode}
              className="w-full text-center"
            >
              {codeSent ? `Повторная отправка через ${timer}с` : 'Получить новый код'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
    )}
    </>
  );
};

export default PhoneVerificationForm;
import React, { useEffect, useState } from 'react';
import { Form, Button, Typography } from 'antd';
import { showNotification } from '../hooks/showNotification';
import { useNavigate } from 'react-router-dom';
import SmsCodeInput from '../components/SMSCodeInput';
import { useAppSelector } from '../hooks/redux';
import useValidatePaymentLink from '../hooks/validateLink';
import { useSendSMSMutation, useVerifySMSMutation } from '../api/smsApi';

const { Title } = Typography;

const PhoneVerificationForm: React.FC = () => {
  const token = localStorage.getItem("access_token");
  const { user, isLoggedIn } = useAppSelector((state) => state.userReducer);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [sendSMS] = useSendSMSMutation();
  const [verifySMS] = useVerifySMSMutation();

  const linkId = useAppSelector((state) => state.courseReducer.paymentLink);

  // Timer state: timerActive controls whether the countdown is running.
  const [timerActive, setTimerActive] = useState(false);
  const [timer, setTimer] = useState(60);
  const [clearError, setClearError] = useState(false);

  const { isValid, component } = useValidatePaymentLink(linkId);

  // On mount, check if a code was sent recently and resume timer if needed.
  useEffect(() => {
    const sendInitialCode = async () => {
      const smsSentTimestamp = localStorage.getItem('smsSentTimestamp');
      const now = Date.now();

      if (smsSentTimestamp) {
        const secondsPassed = Math.floor((now - parseInt(smsSentTimestamp, 10)) / 1000);
        if (secondsPassed < 60) {
          // Code already sent recently, resume the timer with remaining seconds.
          setTimer(60 - secondsPassed);
          setTimerActive(true);
          return;
        }
      }

      // Otherwise, send the code.
      try {
        await sendSMS({ phone: user.phone }).unwrap();
        //showNotification('success', "Код отправлен на номер " + user.phone);
        localStorage.setItem('smsSentTimestamp', String(now));
        setTimerActive(true);
        setTimer(60);
      } catch (e: any) {
        setClearError(true);
        showNotification('error', e.data?.message || 'Ошибка при отправке SMS');
      }
    };

    sendInitialCode();
  }, [sendSMS, user.phone]);

  // Timer countdown effect.
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false); // Countdown finished, enable resend.
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
  }, [timerActive]);

  // Function to handle sending a new code when the user clicks the button.
  const sendNewCode = async () => {
    const smsSentTimestamp = localStorage.getItem('smsSentTimestamp');
    const now = Date.now();

    if (smsSentTimestamp) {
      const secondsPassed = Math.floor((now - parseInt(smsSentTimestamp, 10)) / 1000);
      if (secondsPassed < 60) {
        // Prevent sending a new code if within the cooldown period.
        setTimer(60 - secondsPassed);
        setTimerActive(true);
        return;
      }
    }

    try {
      await sendSMS({ phone: user.phone }).unwrap();
      showNotification('success', "Код отправлен на номер " + user.phone);
      localStorage.setItem('smsSentTimestamp', String(now));
      setTimerActive(true);
      setTimer(60);
    } catch (e: any) {
      setClearError(true);
      showNotification('error', e.data?.message || 'Ошибка при отправке SMS');
    }
  };

  // Handle SMS code verification.
  const onFinish = async (values: { code: string }) => {
    try {
      await verifySMS({ code: values.code, phone: user.phone }).unwrap();
      if (isLoggedIn && token) {
        navigate('/payment');
      } else {
        navigate('/set-password');
      }
    } catch (e: any) {
      showNotification('error', e.data?.message || 'Ошибка верификации SMS');
    }
  };

  // Automatically submit when SMS code input is completed.
  const handleComplete = (code: string) => {
    form.setFieldsValue({ code });
    form.submit();
  };

  return (
    <>
      {!isValid ? component : (
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
                rules={[{ required: true, message: 'Пожалуйста, введите код' }]}
              >
                <SmsCodeInput length={5} onComplete={handleComplete} clearError={clearError} />
              </Form.Item>
              
              <Form.Item>
                <p className='w-full text-center text-gray-600'>
                  Код будет отправлен на номер {user.phone}
                </p>
              </Form.Item>

              {/* Resend Code Button and Timer */}
              <Form.Item>
                <Button
                  type="link"
                  disabled={timerActive}
                  onClick={sendNewCode}
                  className="w-full text-center"
                >
                  {timerActive 
                    ? `Повторная отправка через ${timer}с` 
                    : 'Получить новый код'}
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
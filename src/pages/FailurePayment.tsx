import React from 'react';
import { Button, Typography } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { showNotification } from '../hooks/showNotification';
import { useAppSelector } from '../hooks/redux';
import { useCreateOrderMutation } from '../api/orderApi';
import useValidatePaymentLink from '../hooks/validateLink';

const { Title, Paragraph } = Typography;

const PaymentFailurePage: React.FC = () => {
  const { numberOfMonths, monthlyPayment, paymentLink } = useAppSelector(state => state.courseReducer);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  
  const { isValid, component } = useValidatePaymentLink(paymentLink);

  const handleButtonClick = async () => {
    try {
      const data = await createOrder({
        numberOfMonths,
        monthlyPrice: monthlyPayment,
        linkUUID: paymentLink
      }).unwrap();

      window.location.href = data.paymentUrl;
    } catch (e: any) {
      showNotification('error', e.data?.message || 'Ошибка при подтверждении оплаты');
    }
  };

  return (
    <>
      {!isValid ? component : (
        <div className="flex justify-center items-center min-h-screen w-full bg-gray-100 p-5">
            <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto p-8 bg-white shadow-lg rounded-2xl space-y-6">
            <CloseCircleOutlined style={{ fontSize: 65, color: 'red' }} />
            <Title className="font-rubik text-center" level={3}>Оплата не прошла!</Title>
            <Paragraph className='text-center'>
              Произошла ошибка при обработке платежа. 
              Пожалуйста, попробуйте снова или свяжитесь с поддержкой.
            </Paragraph>
            <Button type="primary" size='large' danger loading={isLoading} onClick={handleButtonClick}>
              Повторить оплату
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentFailurePage;
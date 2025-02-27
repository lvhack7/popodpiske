import React from 'react';
import { Button, Typography } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { showNotification } from '../hooks/showNotification';
import { useAddPaymentMutation } from '../api/orderApi';
import { useParams } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const PaymentFailurePage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const [addPayment, { isLoading }] = useAddPaymentMutation();

  if (!orderId) {
    return (
        <div className="p-10">
            <Title level={2}>Данные не найдены</Title>
        </div>
    )
  }

  const handleButtonClick = async () => {
      try {
          const data = await addPayment(orderId).unwrap();
          window.location.href = data.paymentUrl
      } catch (e: any) {
          showNotification('error', e.data?.message || 'Ошибка при подтверждении оплаты, попробуйте еще раз');
      }
  };

  return (
    <>
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
    </>
  );
};

export default PaymentFailurePage;
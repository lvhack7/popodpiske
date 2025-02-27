// RecurringPayments.tsx
import React, { useState } from 'react';
import { Typography, Button } from 'antd';
//import { useAppSelector } from '../store/hooks'; // or wherever your hook is
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

import PaymentSchedule from '../components/PaymentSchedule'; // The wrapper component
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { formatNumber } from '../utils';
import { useCreateOrderMutation } from '../api/orderApi';
import { showNotification } from '../hooks/showNotification';
import useValidatePaymentLink from '../hooks/validateLink';
import { clearCourse } from '../redux/slices/courseSlice';

const { Title, Text } = Typography;

const PaymentConfirmation: React.FC = () => {
  // 1. Get the data from Redux
  const dispatch = useAppDispatch();
  const [createOrder, {isLoading}] = useCreateOrderMutation()
  const {
    courseName,
    totalPrice,
    numberOfMonths,
    monthlyPayment,
    paymentLink
  } = useAppSelector(state => state.courseReducer);

  const [currentMonthIndex, _] = useState(0);

  const { isValid, component } = useValidatePaymentLink(paymentLink);

  const handlePayCurrentMonth = async () => {
    try {
      const response = await createOrder({
        numberOfMonths,
        monthlyPrice: monthlyPayment,
        linkUUID: paymentLink
      }).unwrap()
      dispatch(clearCourse());

      window.location.href = response.paymentUrl
    } catch(e: any) {
      showNotification('error', e.data?.message || 'Ошибка при создании заказа')
    }
  };

  return (
    <>
    {
      !isValid ? component : (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-5">
        <div className="bg-white p-6 w-full max-w-3xl rounded-xl shadow-md space-y-6">
          <div className="text-center">
            <Title className='font-rubik' level={2}>Расписание будущих платежей</Title>
            <Text type="secondary">
              {`Первый платёж: ${dayjs(new Date()).format('DD.MM.YYYY')}`}
            </Text>
          </div>

          {/* Информация о курсе */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className="flex flex-col space-y-2 p-4 rounded-md text-lg">
              <Text strong>Название курса:</Text>{courseName} <br />
              <Text strong>Общая стоимость:</Text> {formatNumber(totalPrice)}₸ <br />
              <Text strong>Количество месяцев:</Text> {numberOfMonths} <br />
              <Text strong>Сумма за месяц:</Text> {formatNumber(monthlyPayment)}₸ <br />
            </div>

            {/* Monthly payment schedule wrapper */}
            <PaymentSchedule
              dueDate={new Date().toISOString()}
              numberOfMonths={numberOfMonths}
              monthlyPayment={monthlyPayment}
              currentMonthIndex={currentMonthIndex}
            />
          </div>

          {/* Button to pay for current month */}
          <div className="text-center mt-4">
            <Button
              type="primary"
              size='large'
              loading={isLoading}
              onClick={handlePayCurrentMonth}
              disabled={currentMonthIndex >= numberOfMonths}
            >
              Перейти к оплате за текущий месяц
            </Button>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default PaymentConfirmation;

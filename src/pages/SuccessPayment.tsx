import React from 'react';
import { Button, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useSuccessOrderMutation } from '../api/orderApi';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { showNotification } from '../hooks/showNotification';
import useValidatePaymentLink from '../hooks/validateLink';
import { clearCourse } from '../redux/slices/courseSlice';

const { Title, Paragraph } = Typography;

const PaymentSuccessPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { paymentLink } = useAppSelector(state => state.courseReducer);
    const navigate = useNavigate();
    const [successOrder, { isLoading }] = useSuccessOrderMutation();

    const { isValid, component } = useValidatePaymentLink(paymentLink);

    if (!isValid) {
        return component;
    }

    const handleButtonClick = async () => {
        try {
            await successOrder({ linkId: paymentLink }).unwrap();
            dispatch(clearCourse());
            navigate('/dashboard');
        } catch (e: any) {
            showNotification('error', e.data?.message || 'Ошибка при подтверждении оплаты, попробуйте еще раз');
        }
    };

    return (
        <>
            {!isValid ? component : (
                <div className="flex justify-center items-center min-h-screen w-full bg-gray-100 p-5">
                    <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto p-8 bg-white shadow-lg rounded-2xl space-y-6">
                        <CheckCircleOutlined className='text-green-500 text-[70px]' />
                        <Title className="font-rubik text-center" level={3}>Оплата прошла успешно!</Title>
                        <Paragraph className='text-center'>
                            Спасибо! Ваш платеж был успешно обработан.
                        </Paragraph>
                        <Button type="primary" size='large' loading={isLoading} onClick={handleButtonClick}>
                            Вернуться на главную
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentSuccessPage;
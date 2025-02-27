import React from 'react';
import { Button, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { showNotification } from '../hooks/showNotification';
import { clearCourse } from '../redux/slices/courseSlice';


const { Title, Paragraph } = Typography;

const PaymentSuccessPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    if (!orderId) {
        return (
            <div className="p-10">
                <Title level={2}>Данные не найдены</Title>
            </div>
        )
    }

    const handleButtonClick = async () => {
        try {
            dispatch(clearCourse());
            navigate('/dashboard');
        } catch (e: any) {
            showNotification('error', e.data?.message || 'Ошибка при подтверждении оплаты, попробуйте еще раз');
        }
    };

    return (
        <>
            <div className="flex justify-center items-center min-h-screen w-full bg-gray-100 p-5">
                <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto p-8 bg-white shadow-lg rounded-2xl space-y-6">
                    <CheckCircleOutlined className='text-green-500 text-[70px]' />
                    <Title className="font-rubik text-center" level={3}>Оплата прошла успешно!</Title>
                    <Paragraph className='text-center'>
                        Спасибо! Ваш платеж был успешно обработан.
                    </Paragraph>
                    <Button type="primary" size='large' onClick={handleButtonClick}>
                        Вернуться на главную
                    </Button>
                </div>
            </div>
        </>
    );
};

export default PaymentSuccessPage;
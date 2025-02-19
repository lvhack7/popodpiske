import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { useRegisterMutation } from '../api/authApi';
import { showNotification } from '../hooks/showNotification';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import useValidatePaymentLink from '../hooks/validateLink';
import { userCreated, userLoggedIn } from '../redux/slices/userSlice';

const { Title } = Typography;

interface FormValues {
    password: string;
}

const PasswordCreationForm: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [register, {isLoading}] = useRegisterMutation()
    const [form] = Form.useForm();

    const {user} = useAppSelector(state => state.userReducer)

    const linkId = useAppSelector(state => state.courseReducer.paymentLink)

    const { isValid, component } = useValidatePaymentLink(linkId);

    const onFinish = async (values: FormValues) => {
        try {
            const response = await register({
                ...user,
                password: values.password
            }).unwrap();

            localStorage.setItem('access_token', response.accessToken);
            dispatch(userCreated(response.user));
            dispatch(userLoggedIn(true))
            navigate("/payment")
        } catch (e: any) {
            console.error(e);
            showNotification("error", e.data?.message || "Произошла ошибка при создании пароля");
        }
    };

    return (
        <>
        {
        !isValid ? component : (
            <div className="flex justify-center items-center min-h-screen w-full p-5">
                {/* Updated to max-w-3xl for a wider container. You can adjust as needed. */}
                <div className="w-full max-w-lg mx-auto p-10 bg-white shadow-lg rounded-2xl">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }} className='font-rubik'>
                        Создайте пароль
                    </Title>
                    <Form.Item
                        name="password"
                        label="Введите пароль"
                        rules={[
                        { required: true, message: 'Пожалуйста, введите пароль' },
                        { min: 8, message: 'Пароль должен содержать не менее 8 символов' },
                        ]}
                        hasFeedback
                    >
                        <Input.Password size="large" placeholder="Пароль" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        label="Подтвердите пароль"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                        { required: true, message: 'Пожалуйста, подтвердите пароль' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Пароли не совпадают'));
                            },
                        }),
                        ]}
                    >
                        <Input.Password size="large" placeholder="Подтвердите пароль" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        className="w-full"
                        loading={isLoading}
                        >
                        Создать пароль
                        </Button>
                    </Form.Item>
                    </Form>
                </div>
            </div>
        )}
      </>
    );
};

export default PasswordCreationForm;
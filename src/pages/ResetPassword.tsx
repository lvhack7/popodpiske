import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResetPasswordMutation } from '../api/authApi';
import { showNotification } from '../hooks/showNotification';

const { Title } = Typography;

const ResetPassword: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  const [resetPassword, {isLoading}] = useResetPasswordMutation()

  const token = query.get('token') || '';
  const phone = query.get('phone') || '';
  const destination = query.get('destination') || ''

  const onFinish = async (values: any) => {
    try {
      // Call the backend endpoint for password reset
      await resetPassword({
        phone,
        token,
        newPassword: values.password
      })
      // Show a success notification and navigate to login or home page
      navigate(destination);
    } catch (error: any) {
      console.error(error);
      showNotification("error", error.data.message || "Произошла ошибка, попробуйте позже")
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-5">
        <div className="flex flex-col justify-center w-full max-w-lg mx-auto p-10 bg-white shadow-lg rounded-2xl space-y-6">
        <Title className='mx-auto' level={2}>Сброс пароля</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="password"
            label="Новый пароль"
            rules={[{ required: true, message: 'Пожалуйста, введите новый пароль' }]}
            hasFeedback
          >
            <Input.Password size='large' placeholder="Введите новый пароль" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Подтвердите пароль"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Пожалуйста, подтвердите новый пароль' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Пароли не совпадают!'));
                },
              }),
            ]}
          >
            <Input.Password size='large' placeholder="Подтвердите новый пароль" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" size='large' loading={isLoading} htmlType="submit" className="w-full mt-3">
              Сбросить пароль
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
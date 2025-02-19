import React from 'react';
import { Form, Input, Typography } from 'antd';
import { useAppSelector } from '../hooks/redux';


const { Title } = Typography;

type Props = {};

const PersonalInfo: React.FC<Props> = () => {
  const {user} = useAppSelector((state) => state.userReducer);

  return (
    <div className="p-10">
      <Title level={2}>Персональная информация</Title>
      <Form
        layout="vertical"
        initialValues={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          iin: user.iin,
        }}
      >
        <Form.Item label="Имя" name="firstName">
          <Input size="large" disabled className="!bg-transparent !text-black !cursor-not-allowed" />
        </Form.Item>
        <Form.Item label="Фамилия" name="lastName">
          <Input size="large" disabled className="!bg-transparent !text-black !cursor-not-allowed" />
        </Form.Item>
        <Form.Item label="Электронная почта" name="email">
          <Input size="large" disabled className="!bg-transparent !text-black !cursor-not-allowed" />
        </Form.Item>
        <Form.Item label="Номер телефона" name="phone">
          <Input size="large" disabled className="!bg-transparent !text-black !cursor-not-allowed" />
        </Form.Item>
        <Form.Item label="ИИН" name="iin">
          <Input size="large" disabled className="!bg-transparent !text-black !cursor-not-allowed" />
        </Form.Item>
      </Form>
    </div>
  );
};

export default PersonalInfo;
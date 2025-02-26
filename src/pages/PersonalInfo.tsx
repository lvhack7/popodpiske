import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Slider, Typography, Checkbox } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { userCreated } from '../redux/slices/userSlice';
import { useRegisterMutation } from '../api/authApi';
import { showNotification } from '../hooks/showNotification';
import { setCourse } from '../redux/slices/courseSlice';
import { formatBillingDate, formatNumber, getNextBillingDate } from '../utils';
import useValidatePaymentLink from '../hooks/validateLink';


const { Title, Text } = Typography;

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  iin: string;
  terms?: boolean;
}

const PersonalInfoForm: React.FC = () => {
  // Get token from localStorage
  const token = localStorage.getItem("access_token");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();

  // Get user and course data from Redux
  const { user, isLoggedIn } = useAppSelector(state => state.userReducer);
  const courseData = useAppSelector(state => state.courseReducer);
  const paymentLink = courseData.paymentLink;
  const sortedMonthsArray = [...courseData.monthsArray].sort((a, b) => a - b);

  const marks = sortedMonthsArray.reduce((acc: { [key: number]: string }, month: number) => {
    acc[month] = `${month}`;
    return acc;
  }, {});

  // Validate the payment link
  const { isValid, component } = useValidatePaymentLink(paymentLink);

  // Register mutation hook
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  //const [sendCode] = useSendSMSMutation()

  // Local state for subscription details
  const [numberOfMonths, setNumberOfMonths] = useState<number>(sortedMonthsArray[0]);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>();
  const [nextDate, setNextDate] = useState<string>()

  // When the user exists, pre-fill the form
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        iin: user.iin,
      });
    }
  }, [user, form]);

  // Recalculate monthly payment and due date when total price or months change
  useEffect(() => {
    if (!courseData?.totalPrice || !numberOfMonths) {
      setMonthlyPayment(0);
      return;
    }
    setMonthlyPayment(courseData.totalPrice / numberOfMonths);

    const updatedDueDate = getNextBillingDate(new Date().toISOString());
    const uptNextDate = getNextBillingDate(updatedDueDate, numberOfMonths - 2);

    setDueDate(formatBillingDate(updatedDueDate));
    setNextDate(formatBillingDate(uptNextDate))
    
  }, [courseData?.totalPrice, numberOfMonths]);

  // Helper to format phone numbers
  const formatPhone = (phone: string) => {
    let formatted = phone.replace(/[^0-9+]/g, '');
    if (formatted.length > 12) {
      formatted = formatted.slice(0, 12);
    }
    return formatted;
  };

  // Handle form submission
  const handleFinish = useCallback(
    async (values: FormValues) => {
      try {
        const formattedPhone = formatPhone(values.phone);

        // Update course details in Redux
        dispatch(
          setCourse({
            numberOfMonths,
            monthlyPayment,
            dueDate,
          })
        );

        //await sendCode({phone: formattedPhone})

        if (!isLoggedIn || !token) {
          dispatch(userCreated({
            ...values,
            phone: formattedPhone
          }));
        }

        navigate('/verify-phone');
      } catch (e: any) {
        console.error(e);
        showNotification(
          'error',
          'Произошла ошибка',
          e.data?.message || 'Не предвиденная ошибка, попробуйте позже'
        );
      }
    },
    [
      numberOfMonths,
      monthlyPayment,
      dueDate,
      dispatch,
      isLoggedIn,
      token,
      navigate,
      register,
      paymentLink,
    ]
  );

  return (
    <>
    {
      !isValid ? component : (
        <div className="flex justify-center items-center min-h-screen w-full py-5 px-4">
          <div className="max-w-lg mx-auto px-8 py-6 bg-white shadow-lg rounded-2xl">
            <Title
              className="font-rubik"
              level={2}
              style={{ textAlign: 'center', marginBottom: '40px' }}
            >
              Сбор персональных данных
            </Title>

            <Form form={form} layout="vertical" onFinish={handleFinish}>
              {/* Имя и Фамилия */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Form.Item
                  name="firstName"
                  label="Имя"
                  rules={[{ required: true, message: 'Пожалуйста, введите ваше имя' }]}
                >
                  <Input
                    size="large"
                    placeholder="Введите имя"
                    disabled={!!user?.firstName}
                  />
                </Form.Item>
                <Form.Item
                  name="lastName"
                  label="Фамилия"
                  rules={[{ required: true, message: 'Пожалуйста, введите вашу фамилию' }]}
                >
                  <Input
                    size="large"
                    placeholder="Введите фамилию"
                    disabled={!!user?.lastName}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="email"
                label="Электронная почта"
                rules={[
                  { required: true, message: 'Пожалуйста, введите вашу электронную почту' },
                  { type: 'email', message: 'Пожалуйста, введите корректный адрес электронной почты' },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Введите электронную почту"
                  disabled={!!user?.email}
                />
              </Form.Item>

              {/* Номер телефона */}
              <Form.Item name="phone" label="Номер телефона" className="mb-6">
                <Input
                  size="large"
                  disabled
                  defaultValue={user?.phone}
                />
              </Form.Item>

              {/* ИИН */}
              <Form.Item
                name="iin"
                label="ИИН"
                className="mb-6"
                validateFirst
                rules={[
                  { required: true, message: 'Пожалуйста, введите ИИН' },
                  {
                    validator: (_, value) => {
                      if (user?.iin) return Promise.resolve();
                      
                      if (value.length !== 12) {
                        return Promise.reject(new Error('ИИН должен содержать 12 цифр'));
                      }

                      const validateDOBString = (iin: string): boolean => {
                        const dobStr = iin.slice(0, 6);
                        const year = parseInt(dobStr.slice(0, 2), 10);
                        const month = parseInt(dobStr.slice(2, 4), 10);
                        const day = parseInt(dobStr.slice(4, 6), 10);
                        if (month < 1 || month > 12 || day < 1 || day > 31) return false;
                        const currentYear = new Date().getFullYear();
                        const fullYear = year + (year > currentYear % 100 ? 1900 : 2000);
                        const dob = new Date(fullYear, month - 1, day);
                        if (
                          dob.getFullYear() !== fullYear ||
                          dob.getMonth() + 1 !== month ||
                          dob.getDate() !== day ||
                          fullYear > currentYear
                        ) {
                          return false;
                        }
                        return true;
                      };

                      if (!validateDOBString(value)) {
                        return Promise.reject(new Error('Неверный ИИН'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  size="large"
                  disabled={!!user?.iin}
                  placeholder="Введите 12-значный ИИН"
                  maxLength={12}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, '');
                    form.setFieldsValue({ iin: onlyDigits });
                  }}
                />
              </Form.Item>

              {/* Название курса */}
              <Form.Item label="Название курса">
                <Text strong style={{ fontSize: '18px' }}>
                  {courseData.courseName}
                </Text>
              </Form.Item>

              {/* Общая сумма */}
              <Form.Item label="Общая сумма к оплате">
                <Text strong className="text-2xl text-blue-600">
                  {formatNumber(courseData.totalPrice)} KZT
                </Text>
              </Form.Item>

              {/* Срок подписки (Слайдер) */}
              <Form.Item label="Срок подписки (месяцы)">
                <div className='mx-2'>
                  <Slider
                    min={sortedMonthsArray[0]}
                    max={sortedMonthsArray[sortedMonthsArray.length - 1]}
                    step={null}
                    marks={marks}
                    value={numberOfMonths}
                    onChange={(val: number) => setNumberOfMonths(val)}
                    tooltip={{ formatter: null }}
                  />
                </div>
              </Form.Item>

              {/* Ежемесячный платеж */}
              <Form.Item label="Ежемесячный платеж (Без % и переплат)">
                <Text strong className="text-xl">
                  {formatNumber(monthlyPayment)} KZT
                </Text>
              </Form.Item>

              <Form.Item label="Следующее списание">
                <Text strong className="text-blue-600 text-lg">
                  {nextDate}
                </Text>
              </Form.Item>

              <Form.Item label="Последний платеж">
                <Text strong className="text-blue-600 text-lg">
                  {dueDate}
                </Text>
              </Form.Item>

              {/* Документы */}
              <Form.Item>
                <ul className="list-disc list-inside text-blue-600">
                  <li>
                    <a
                      className="text-blue-600 hover:underline"
                      href="/docs/Безопасность_платежей_OneVision.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Безопасность платежей (PDF)
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-blue-600 hover:underline"
                      href="/docs/Оферта_на_заключение_лицензионного_договора.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Оферта на заключение лицензионного договора (PDF)
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-blue-600 hover:underline"
                      href="/docs/Политика_обработки_персональных_данных.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Политика обработки персональных данных (PDF)
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-blue-600 hover:underline"
                      href="https://relitalk.com/oferta2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Оферта на заключение договора на консультационно-информационное сопровождение на интерактивных курсах
                    </a>
                  </li>
                  <li>
                    <Link className="text-blue-600 hover:underline" to="/credentials">
                      Реквизиты компании
                    </Link>
                  </li>
                </ul>
              </Form.Item>

              {/* Согласие */}
              <Form.Item
                name="terms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error('Вы должны согласиться с условиями')),
                  },
                ]}
              >
                <Checkbox>
                  Я подтверждаю, что ознакомился(ась) с документами и согласен(на) с условиями.
                </Checkbox>
              </Form.Item>

              {/* Кнопка Далее */}
              <Form.Item>
                <Button
                  size="large"
                  type="primary"
                  htmlType="submit"
                  loading={isRegisterLoading}
                  className="w-full mt-5"
                >
                  Далее
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      ) 
    }
    </>
  );
};

export default PersonalInfoForm;
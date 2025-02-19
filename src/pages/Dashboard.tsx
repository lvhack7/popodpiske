import { FC, useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import OrdersList from '../components/OrdersList';
import PersonalInfo from '../components/PersonalInfo';
import { useGetOrdersQuery } from '../api/orderApi';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { userClosed } from '../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { Button, Spin, Typography } from 'antd';
import { baseApi } from '../api';

const { Title } = Typography;

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("access_token");
  const { isLoggedIn } = useAppSelector(state => state.userReducer);

  const [page, setPage] = useState<string>('orders');
  const { data, error, isLoading } = useGetOrdersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!isLoggedIn || !token) {
      dispatch(userClosed());
      localStorage.removeItem("access_token");
      navigate('/auth'); // Redirect to login page if not authenticated
    }
  }, [isLoggedIn, token, dispatch, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <Title level={2}>Произошла ошибка при загрузке данных</Title>
      </div>
    );
  }

  const handleLogout = () => {
      // Clear any authentication tokens or user data here
      localStorage.removeItem('access_token');
      dispatch(userClosed())
      dispatch(baseApi.util.resetApiState())
      navigate('/auth');
  };

  return (
    <div className="flex flex-col p-5 lg:p-10">
      <div className="flex items-center justify-between">
        <div className='flex items-end space-x-3 lg:space-x-5'>
          <div
            onClick={() => setPage('orders')}
            className={`${page === 'orders' ? 'text-xl lg:text-3xl text-black' : 'text-lg lg:text-xl text-gray-500'} font-semibold cursor-pointer transition-all duration-150`}
          >
            Мои курсы
          </div>
          <div
            onClick={() => setPage('info')}
            className={`${page === 'info' ? 'text-xl lg:text-3xl text-black' : 'text-lg lg:text-xl text-gray-500'} font-semibold cursor-pointer transition-all duration-150`}
          >
            Мои данные
          </div>
        </div>
          <Button
              type="default"
              className="!bg-red-500 hover:bg-red-200 !border-none !text-white"
              onClick={handleLogout}
          >
              Выйти
          </Button>
      </div>
      <div className="mt-10">
        <TransitionGroup>
          <CSSTransition
            key={page}
            timeout={300}
            classNames="fade"
          >
            <div>
              {page === 'orders' ? <OrdersList orders={data ?? []} /> : <PersonalInfo />}
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>
    </div>
  );
};

export default Dashboard;
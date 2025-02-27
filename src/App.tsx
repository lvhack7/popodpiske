import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAppSelector } from './hooks/redux';
import MainLayout from './components/Layout';
import { Spin } from 'antd';

// Lazy load the components
const PersonalInfoForm = lazy(() => import('./pages/PersonalInfo'));
const PhoneVerificationForm = lazy(() => import('./pages/PhoneVerification'));
const PasswordCreationForm = lazy(() => import('./pages/PasswordCreation'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PaymentConfirmation = lazy(() => import('./pages/PaymentConfirmation'));
const CompanyDetails = lazy(() => import('./pages/CompanyDetails'));
const PaymentSuccessPage = lazy(() => import('./pages/SuccessPayment'));
const PaymentFailurePage = lazy(() => import('./pages/FailurePayment'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const App = () => {
  const token = localStorage.getItem('access_token');
  const { isLoggedIn } = useAppSelector((state) => state.userReducer);

  return (
    <BrowserRouter>
      <Suspense fallback={<div className='flex items-center justify-center'><Spin/></div>}>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={`${isLoggedIn && token ? '/dashboard' : '/login'}`}
                replace
              />
            }
          />
          <Route element={<MainLayout />}>
            <Route path="/login" element={<Subscribe />} />
            <Route path="/reset" element={<ResetPassword />} />
            <Route path="/personal-info" element={<PersonalInfoForm />} />
            <Route path="/verify-phone" element={<PhoneVerificationForm />} />
            <Route path="/set-password" element={<PasswordCreationForm />} />
            <Route path="/payment" element={<PaymentConfirmation />} />
          </Route>
          <Route path="/success/:orderId" element={<PaymentSuccessPage />} />
          <Route path="/failure/:orderId" element={<PaymentFailurePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/credentials" element={<CompanyDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;

import { Typography, Spin } from 'antd';
import { useValidatePaymentLinkQuery } from '../api/orderApi';

const { Title } = Typography;

const useValidatePaymentLink = (linkId: string) => {
  const {
    data,
    error: paymentLinkError,
    isLoading: isPaymentLinkLoading,
  } = useValidatePaymentLinkQuery(linkId, {
    skip: !linkId,
    refetchOnMountOrArgChange: true,
  });

  if (!linkId) {
    return {
      isValid: true,
      data: null, // No course data since there’s no link
    };
  }

  if (isPaymentLinkLoading) {
    return {
      isValid: false,
      component: (
        <div className="flex items-center justify-center h-screen">
          <Spin />
        </div>
      ),
    };
  }

  if (paymentLinkError) {
    const msg =
      'data' in paymentLinkError && paymentLinkError.data
        ? (paymentLinkError.data as { message: string }).message
        : 'Произошла ошибка';

    return {
      isValid: false,
      component: (
        <div className="p-10">
          <Title level={2}>{msg}</Title>
        </div>
      ),
    };
  }

  if (!data) {
    return {
      isValid: false,
      component: (
        <div className="p-10">
          <Title level={2}>Данные не найдены</Title>
        </div>
      ),
    };
  }

  return {
    isValid: true,
    data,
  };
};

export default useValidatePaymentLink;
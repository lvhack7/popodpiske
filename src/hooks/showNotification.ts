import { notification } from 'antd';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

export const showNotification = (
  type: NotificationType,
  message: string,
  description?: string
): void => {
  notification[type]({
    message,
    description,
    placement: 'topRight', // You can set placement to 'topLeft', 'bottomLeft', or 'bottomRight'
  });
};
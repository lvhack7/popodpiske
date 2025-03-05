import React, { useState } from 'react';
import { Button, Collapse, Descriptions, Table, Tag, Typography, Modal, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Order } from '../models/Order';
import { CaretRightOutlined } from '@ant-design/icons';
import { Payment } from '../models/Payment';
import { formatNumber, getNextBillingDate } from '../utils';
import { useAddPaymentMutation, useCancelOrderMutation } from '../api/orderApi';
import { showNotification } from '../hooks/showNotification';

const { Panel } = Collapse;
const { Title } = Typography;


const statusMapping: { [key: string]: { text: string; color: string } } = {
  success: { text: 'Успешно', color: 'green' },
  failure: { text: 'Отказ', color: 'red' },
  pending: { text: 'В ожидании', color: 'orange' },
  cancel: { text: 'Не будет списано', color: 'gray' }
};

const orderStatusMapping: { [key: string]: { text: string; color: string; bgColor: string } } = {
  pending: { text: 'В ожидании оплаты', color: 'gray',  bgColor: 'bg-gray-100' },
  active: { text: 'Активный', color: 'green', bgColor: 'bg-green-100' },
  past_due: { text: 'Просроченный', color: 'orange', bgColor: 'bg-orange-200' },
  completed: { text: 'Завершенный', color: 'blue', bgColor: 'bg-blue-200' },
  cancelled: { text: 'Отмененный', color: 'red', bgColor: 'bg-red-200' },
};

const formatDate = (date?: string | Date): string => {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

interface OrdersListProps {
  orders: Order[];
}

const OrdersList: React.FC<OrdersListProps> = ({ orders }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');
  const [addPayment, { isLoading: isAddPaymentLoading }] = useAddPaymentMutation();
  const [cancelOrder, { isLoading: isCancelLoading }] = useCancelOrderMutation();

  const showCancelModal = (orderId: number, courseName: string) => {
    setSelectedOrderId(orderId);
    setSelectedCourseName(courseName);
    setIsModalVisible(true);
  };

  const handleCancelOrder = async () => {
    if (selectedOrderId !== null) {
      await cancelOrder(selectedOrderId);
      setIsModalVisible(false);
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  const handleAddPayment = async (orderId: string) => {
    try {
      const data = await addPayment(orderId).unwrap();
      window.location.href = data.paymentUrl;
    } catch (error: any) {
      showNotification('error', error.data?.message || 'Ошибка при добавлении платежа');
    }
  };

  const buildPaymentsArray = (order: Order): Payment[] => {
    const { payments, numberOfMonths, monthlyPrice, status } = order;

    if (order.nextBillingDate === null && status === "pending") return [];

    const sorted = [...payments].sort(
      (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );

    const monthlyAmt = monthlyPrice;
    let nextBillingDate = order.nextBillingDate;

    const result: Payment[] = [];
    for (let i = 0; i < numberOfMonths; i++) {
      const real = sorted[i];
      if (real) {
        result.push(real);
      } else {
        result.push({
          id: 0,
          amount: monthlyAmt,
          currency: 'KZT',
          status: order.status === "cancelled" ? 'cancel' : 'pending',
          paymentDate: nextBillingDate,
        });
        nextBillingDate = getNextBillingDate(nextBillingDate);
      }
    }

    return result;
  };

  const paymentColumns: ColumnsType<Payment> = [
    {
      title: 'Дата платежа',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (val: Date) => formatDate(val),
    },
    {
      title: 'Сумма, KZT',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => formatNumber(val),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const { text, color } = statusMapping[status] || { text: status, color: 'default' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    // {
    //   title: 'Transaction ID',
    //   dataIndex: 'transactionId',
    //   key: 'transactionId',
    //   render: (val?: string) => val || '—',
    // },
  ];

  return (
    <div>
      <Title level={3}>Подписки на курсы</Title>
      {orders.length === 0 ? (
        <Empty description="Нет подписок для отображения" />
      ) : (
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          accordion
          className="space-y-4 bg-transparent"
        >
          {orders.map((order) => {
            const allPayments = buildPaymentsArray(order);
            const panelHeader = `Заказ #${order.id} — ${order.link.course.courseName}`;
            const panelBgColor = orderStatusMapping[order.status]?.bgColor || 'white';

            return (
              <Panel key={order.id} className={`font-bold ${panelBgColor} rounded-lg shadow-md py-2`} header={panelHeader}>
                <Descriptions
                  bordered
                  size="small"
                  column={1}
                  labelStyle={{ fontWeight: 'bold', width: 200 }}
                  className="bg-white"
                >
                  <Descriptions.Item label="Статус заказа">
                    <Tag color={orderStatusMapping[order.status]?.color}>
                      {orderStatusMapping[order.status]?.text}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Название курса">
                    {order?.courseName || order.link.course.courseName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Общая стоимость, KZT">
                    {formatNumber(order?.totalPrice)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Количество месяцев">
                    {order.numberOfMonths}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ежемесячная цена, KZT">
                    {formatNumber(order.monthlyPrice)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Следующая дата списания">
                    {formatDate(order.nextBillingDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Осталось платежей">
                    {order.remainingMonth}
                  </Descriptions.Item>
                </Descriptions>

                <Title level={5} className='mt-5'>Список платежей</Title>
                <Table<Payment>
                  columns={paymentColumns}
                  dataSource={allPayments}
                  pagination={false}
                  rowKey={(rec, idx) => rec.id ? String(rec.id) : `pending-${idx}`}
                />
                <div className='flex flex-row flex-wrap justify-end items-center mt-3 gap-3'>
                  {(!order.nextBillingDate || order?.payments?.length === 0) && (
                    <Button variant='outlined' color='primary' size='large' type='primary' loading={isAddPaymentLoading} onClick={() => handleAddPayment(order.paymentId)}>
                      Добавить метод оплаты
                    </Button>
                  )}
                  {(order.status !== "cancelled" && order.status !== "completed") && (
                    <Button variant='outlined' color='danger' size='large' type='primary' onClick={() => showCancelModal(order.id, order.link.course.courseName)}>
                      Отменить подписку
                    </Button>
                  )}
                </div>
              </Panel>
            );
          })}
        </Collapse>
      )}

      <Modal
        title="Отмена подписки"
        visible={isModalVisible}
        onCancel={handleCancelModal}
        footer={[
          <Button key="back" onClick={handleCancelModal}>
            Отмена
          </Button>,
          <Button key="submit" type="primary" danger loading={isCancelLoading} onClick={handleCancelOrder}>
            Подтвердить
          </Button>,
        ]}
      >
        <p className='py-5'>Вы уверены, что хотите отменить подписку на {selectedCourseName}?</p>
      </Modal>
    </div>
  );
};

export default OrdersList;
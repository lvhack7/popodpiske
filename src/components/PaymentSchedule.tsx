import { FC } from 'react';
import { Steps } from 'antd';
import dayjs from 'dayjs';
import { formatNumber } from '../utils';

interface PaymentScheduleProps {
  dueDate: string;          // Starting date (e.g. "2025-01-28")
  numberOfMonths: number;   // Any positive number
  monthlyPayment: number;   // e.g. 400
  currentMonthIndex: number; // 0-based index for the "active" month
}

const PaymentSchedule: FC<PaymentScheduleProps> = ({
  dueDate,
  numberOfMonths,
  monthlyPayment,
  currentMonthIndex,
}) => {
  const startDate = dayjs(dueDate);
  const fullViewThreshold = 6; // If numberOfMonths <= 6, show full view; otherwise, show condensed

  // Full view: one step per month
  if (numberOfMonths <= fullViewThreshold) {
    const stepsData = Array.from({ length: numberOfMonths }, (_, i) => {
      const monthNumber = i + 1;
      const dateForMonth = startDate.add(i, 'month').format('DD.MM.YYYY');
      return {
        title: `Месяц ${monthNumber}`,
        description: (
          <>
            <div>Сумма: {formatNumber(monthlyPayment)}₸</div>
            <div>Дата: {dateForMonth}</div>
          </>
        ),
      };
    });
    return (
      <Steps
        direction="vertical"
        current={currentMonthIndex}
        items={stepsData.map((step) => ({
          title: step.title,
          description: step.description,
        }))}
      />
    );
  }

  // Condensed view: show only the first month, ellipsis, and the last month
  else {
    const dateMonth1 = startDate.format('DD.MM.YYYY');
    const dateMonthN = startDate
      .add(numberOfMonths - 1, 'month')
      .format('DD.MM.YYYY');

    // Map the actual currentMonthIndex into the condensed view:
    //   0 => first step, numberOfMonths-1 => last step, anything else => ellipsis
    let condensedCurrent: number;
    if (currentMonthIndex <= 0) {
      condensedCurrent = 0;
    } else if (currentMonthIndex >= numberOfMonths - 1) {
      condensedCurrent = 2;
    } else {
      condensedCurrent = 1;
    }

    const stepsData = [
      {
        title: 'Месяц 1',
        description: (
          <>
            <div>Сумма: {formatNumber(monthlyPayment)}₸</div>
            <div>Дата: {dateMonth1}</div>
          </>
        ),
      },
      {
        title: '...',
        description: 'Промежуточные месяцы',
      },
      {
        title: `Месяц ${numberOfMonths}`,
        description: (
          <>
            <div>Сумма: {formatNumber(monthlyPayment)}₸</div>
            <div>Дата: {dateMonthN}</div>
          </>
        ),
      },
    ];

    return (
      <Steps
        direction="vertical"
        current={condensedCurrent}
        items={stepsData.map((step) => ({
          title: step.title,
          description: step.description,
        }))}
      />
    );
  }
};

export default PaymentSchedule;
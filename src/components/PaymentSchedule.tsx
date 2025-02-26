import { FC } from 'react';
import { Steps } from 'antd';
import { formatBillingDate, formatNumber } from '../utils';
import { getNextBillingDate } from '../utils';

interface PaymentScheduleProps {
  dueDate: string;          // Last billing date (already in DD.MM.YYYY format)
  numberOfMonths: number;   // Total billing cycles
  monthlyPayment: number;   // e.g. 400
  currentMonthIndex: number; // 0-based index for the "active" month
}

const PaymentSchedule: FC<PaymentScheduleProps> = ({
  dueDate,
  numberOfMonths,
  monthlyPayment,
  currentMonthIndex,
}) => {
  // Today's billing date is taken from new Date() and converted to ISO (yyyy-mm-dd)
  const todayIso = new Date().toISOString().split('T')[0];
  // Format today's date to DD.MM.YYYY using your utility function.
  const todayBillingFormatted = formatBillingDate(todayIso);

  // If there are 3 or fewer months, show a full view (one step per month)
  if (numberOfMonths <= 3) {
    let billingDate = todayIso;
    const stepsData = Array.from({ length: numberOfMonths }, (_, i) => {
      const formattedDate = formatBillingDate(billingDate);
      const step = {
        title: `Месяц ${i + 1}`,
        description: (
          <>
            <div>Сумма: {formatNumber(monthlyPayment)}₸</div>
            <div>Дата: {formattedDate}</div>
          </>
        ),
      };
      // Compute the next billing date for the next step
      billingDate = getNextBillingDate(billingDate, 1);
      return step;
    });

    return (
      <Steps
        direction="vertical"
        current={currentMonthIndex}
        items={stepsData}
      />
    );
  }
  // Condensed view: show only two steps if numberOfMonths > 3:
  // - The first step shows today's billing date.
  // - The last step shows the dueDate (the final billing date, already in DD.MM.YYYY format).
  // - The ellipsis indicates intermediate months.
  else {
    // Map the currentMonthIndex to one of the three steps:
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
            <div>Дата: {todayBillingFormatted}</div>
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
            <div>Дата: {dueDate}</div>
          </>
        ),
      },
    ];

    return (
      <Steps
        direction="vertical"
        current={condensedCurrent}
        items={stepsData}
      />
    );
  }
};

export default PaymentSchedule;
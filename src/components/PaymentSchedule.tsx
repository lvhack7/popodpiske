import { FC } from 'react';
import { Steps } from 'antd';
import { formatBillingDate, formatNumber } from '../utils';
import { getNextBillingDate } from '../utils'; // or wherever it's defined


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
  const fullViewThreshold = 6; // Show full view if months <= 6

  // Full view: one step per month
  if (numberOfMonths <= fullViewThreshold) {
    let billingDate = dueDate; // start with the due date
    const stepsData = Array.from({ length: numberOfMonths }, (_, i) => {
      // Format current billing date
      const formattedBillingDate = formatBillingDate(billingDate);
      // Create the step
      const step = {
        title: `Месяц ${i + 1}`,
        description: (
          <>
            <div>Сумма: {formatNumber(monthlyPayment)}₸</div>
            <div>Дата: {formattedBillingDate}</div>
          </>
        ),
      };
      // Get the next billing date for the following month
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

  // Condensed view: show only the first month, ellipsis, and the last month
  else {
    const firstBillingDateFormatted = formatBillingDate(dueDate);
    let lastBillingDate = dueDate;
    // Compute the billing date for the last month by iterating
    for (let i = 1; i < numberOfMonths; i++) {
      lastBillingDate = getNextBillingDate(lastBillingDate, 1);
    }
    const lastBillingDateFormatted = formatBillingDate(lastBillingDate);

    // Map the actual currentMonthIndex into the condensed view:
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
            <div>Дата: {firstBillingDateFormatted}</div>
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
            <div>Дата: {lastBillingDateFormatted}</div>
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
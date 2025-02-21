export const API_URL = 'https://api.popodpiske.com' //'http://localhost:5002' "https://api.popodpiske.com"

export const formatDate = (date: Date, type: 'rus' | 'eng' = 'rus'): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return type === 'rus' ? `${day}.${month}.${year}` : `${year}-${month}-${day}`;
};

export const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
};

export function getNextBillingDate(currentNextBillingDate: string): string {
  const currentNextBilling = currentNextBillingDate ? new Date(currentNextBillingDate) : new Date();
  const currentDay = currentNextBilling.getDate();

  const newDate = new Date(currentNextBilling);
  newDate.setMonth(newDate.getMonth() + 1);

  // Check if the day exists in the new month
  if (newDate.getDate() !== currentDay) {
      // Set to the start of the next month
      newDate.setDate(1);
  }

  const formattedDate = newDate.toISOString().split('T')[0];
  return formattedDate;
}
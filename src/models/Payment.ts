export interface Payment {
    id: number;
    amount: number;
    currency: string;
    status: string;
    paymentDate: string;
    transactionId?: string;
}
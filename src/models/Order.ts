import { Link } from "./Link";
import { Payment } from "./Payment";

export interface Order {
    id: number;               // Primary key
    numberOfMonths: number;
    monthlyPrice: number;
    nextBillingDate: string; // e.g. "2025-01-31"
    remainingMonth: number;
    status: string;
    userId: number;
    paymentId: string;
    payments: Payment[]; 
    link: Link     // A list of Payment objects
}
import { apiRequest } from "./api";

export type PaymentStatus = "pending" | "paid";

export type Payment = {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  category: string;
  responsible: string;
  status: PaymentStatus;
};

export type CreatePaymentData = {
  description: string;
  amount: number;
  due_date: string;
  category: string;
  responsible: string;
  status: PaymentStatus;
};

export async function getPayments(): Promise<Payment[]> {
  return apiRequest<Payment[]>("/payments");
}

export async function createPayment(
  payment: CreatePaymentData
): Promise<Payment> {
  return apiRequest<Payment>("/payments", {
    method: "POST",
    body: payment,
  });
}

export async function updatePayment(
  id: number,
  payment: CreatePaymentData
): Promise<Payment> {
  return apiRequest<Payment>(`/payments/${id}`, {
    method: "PUT",
    body: payment,
  });
}

export async function deletePayment(id: number): Promise<void> {
  await apiRequest<void>(`/payments/${id}`, {
    method: "DELETE",
  });
}
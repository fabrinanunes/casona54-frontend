import { apiUrl } from "./api";

export type Payment = {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  category: string;
  responsible: string;
  status: string;
};

export type CreatePaymentData = {
  description: string;
  amount: number;
  due_date: string;
  category: string;
  responsible: string;
  status: string;
};

export async function getPayments(): Promise<Payment[]> {
   const response = await fetch(`${apiUrl}/payments`, {
      credentials: "include",
   });

   if (!response.ok) {
      throw new Error("Error getting payments")
   }

   return response.json();
}

export async function createPayment(payment: CreatePaymentData): Promise<Payment> {
   const response = await fetch(`${apiUrl}/payments`, {
      method: 'POST',
      headers: {
         'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payment)
   });

   if (!response.ok) {
      throw new Error('Error creating a payment')
   }

   return response.json();
}

export async function updatePayment(id: number, payment: CreatePaymentData): Promise<Payment> {
   const response = await fetch(`${apiUrl}/payments/${id}`, {
      method: 'PUT',
      headers: {
         'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payment),
   });

    if (!response.ok) {
      throw new Error('Error updating payment')
   }

   return response.json();
}

export async function deletePayment(id: number): Promise<void> {
  const response = await fetch(`${apiUrl}/payments/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir pagamento");
  }
}
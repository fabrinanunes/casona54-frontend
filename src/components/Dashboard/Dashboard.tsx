import { useEffect, useState } from "react";
import PaymentModal from "../PaymentModal/PaymentModal";

import "./Dashboard.css";

type Payment = {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  category: string;
  responsible: string;
  status: string;
};

type PaymentFormData = {
  description: string;
  amount: string | number;
  dueDate: string;
  category: string;
  responsible: string;
  status: string;
};

type DashboardProps = {
  onLogout: () => void;
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function Dashboard({ onLogout }: DashboardProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentFormData | null>(
    null,
  );
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [newPayment, setNewPayment] = useState({
    description: "",
    amount: "",
    dueDate: "",
    category: "",
    responsible: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPayments = async () => {
      const response = await fetch(`${API_URL}/payments`, {
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Erro ao buscar pagamentos");
        return;
      }

      const data = await response.json();

      setPayments(data);
      console.log("data", data);
    };

    fetchPayments();
  }, []);

  const totalAmount = payments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );

  const paidAmount = payments
    .filter((payment) => payment.status === "paid")
    .reduce((total, payment) => total + payment.amount, 0);

  const pendingAmount = payments
    .filter((payment) => payment.status === "pending")
    .reduce((total, payment) => total + payment.amount, 0);

  const filteredPayments = payments.filter((payment) => {
    if (statusFilter === "all") {
      return true;
    }

    return payment.status === statusFilter;
  });

  const handleCreatePayment = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const response = await fetch(`${API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        description: newPayment.description,
        amount: Number(newPayment.amount),
        due_date: newPayment.dueDate,
        category: newPayment.category,
        responsible: newPayment.responsible,
        status: "pending",
      }),
    });

    if (!response.ok) {
      console.error("Erro ao criar pagamento");
      return;
    }

    const createdPayment = await response.json();

    setPayments((currentPayments) => [...currentPayments, createdPayment]);

    setIsPaymentModalOpen(false);

    setNewPayment({
      description: "",
      amount: "",
      dueDate: "",
      category: "",
      responsible: "",
    });
  };

  const handleUpdatePayment = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (editingPayment === null || editingPaymentId === null) {
      return;
    }

    const response = await fetch(
      `${API_URL}payments/${editingPaymentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          description: editingPayment.description,
          amount: Number(editingPayment.amount),
          due_date: editingPayment.dueDate,
          category: editingPayment.category,
          responsible: editingPayment.responsible,
          status: editingPayment.status,
        }),
      },
    );

    if (!response.ok) {
      console.error("Erro ao atualizar pagamento");
      return;
    }

    const updatedPayment = await response.json();

    setPayments((currentPayments) =>
      currentPayments.map((payment) =>
        payment.id === updatedPayment.id ? updatedPayment : payment,
      ),
    );

    setEditingPayment(null);
    setEditingPaymentId(null);
  };

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Nosso Lar</p>
          <h1>Controle financeiro</h1>
        </div>

        <button className="dashboard__logout" onClick={onLogout}>
          Sair
        </button>
      </header>

      <section className="dashboard__content">
        <div className="dashboard__summary">
          <div className="dashboard__card">
            <span>Total</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>

          <div className="dashboard__card">
            <span>Pago</span>
            <strong>{formatCurrency(paidAmount)}</strong>
          </div>

          <div className="dashboard__card">
            <span>Pendente</span>
            <strong>{formatCurrency(pendingAmount)}</strong>
          </div>
        </div>

        <section className="dashboard__payments">
          <div className="dashboard__payments-header">
            <div>
              <h2>Pagamentos</h2>
              <p>Acompanhe os gastos da construção</p>
            </div>

            <button onClick={() => setIsPaymentModalOpen(true)}>
              Novo pagamento
            </button>
          </div>

          <div className="dashboard__filters">
            <button
              className={statusFilter === "all" ? "active" : ""}
              onClick={() => setStatusFilter("all")}
            >
              Todos
            </button>

            <button
              className={statusFilter === "pending" ? "active" : ""}
              onClick={() => setStatusFilter("pending")}
            >
              Pendentes
            </button>

            <button
              className={statusFilter === "paid" ? "active" : ""}
              onClick={() => setStatusFilter("paid")}
            >
              Pagos
            </button>
          </div>

          <div className="dashboard__payments-table-header">
            <span>Descrição</span>
            <span>Valor</span>
            <span>Vencimento</span>
            <span>Status</span>
          </div>

          <div className="dashboard__payments-list">
            {filteredPayments.length === 0 ? (
              <div className="dashboard__empty">
                {statusFilter === "paid"
                  ? "Nenhum pagamento marcado como pago."
                  : statusFilter === "pending"
                    ? "Nenhum pagamento pendente."
                    : "Nenhum pagamento encontrado."}
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.id}>
                  <div>
                    <strong>{payment.description}</strong>
                    <small>{payment.category}</small>
                  </div>

                  <span>{formatCurrency(payment.amount)}</span>

                  <span>{formatDate(payment.due_date)}</span>

                  <div className="payment-actions">
                    <span
                      className={`payment-status payment-status--${payment.status}`}
                    >
                      {payment.status === "paid" ? "Pago" : "Pendente"}
                    </span>

                    <button
                      className="payment-edit"
                      type="button"
                      onClick={() => {
                        setEditingPaymentId(payment.id);

                        setEditingPayment({
                          description: payment.description,
                          amount: payment.amount,
                          dueDate: payment.due_date,
                          category: payment.category,
                          responsible: payment.responsible,
                          status: payment.status,
                        });
                      }}
                    >
                      Editar
                    </button>

                    <button
                      className="payment-delete"
                      type="button"
                      onClick={async () => {
                        const confirmed = window.confirm(
                          `Deseja excluir o pagamento "${payment.description}"?`,
                        );

                        if (!confirmed) {
                          return;
                        }

                        const response = await fetch(
                          `${API_URL}/payments/${payment.id}`,
                          {
                            method: "DELETE",
                            credentials: "include",
                          },
                        );

                        if (!response.ok) {
                          console.error("Erro ao excluir pagamento");
                          return;
                        }

                        setPayments((currentPayments) =>
                          currentPayments.filter(
                            (item) => item.id !== payment.id,
                          ),
                        );
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>

      {isPaymentModalOpen && (
        <PaymentModal
          mode="create"
          payment={{
            ...newPayment,
            status: "pending",
          }}
          onChange={(payment) => {
            setNewPayment({
              description: payment.description,
              amount: String(payment.amount),
              dueDate: payment.dueDate,
              category: payment.category,
              responsible: payment.responsible,
            });
          }}
          onClose={() => setIsPaymentModalOpen(false)}
          onSubmit={handleCreatePayment}
        />
      )}

      {editingPayment && editingPaymentId !== null && (
        <PaymentModal
          mode="edit"
          payment={editingPayment}
          onChange={setEditingPayment}
          onClose={() => {
            setEditingPayment(null);
            setEditingPaymentId(null);
          }}
          onSubmit={handleUpdatePayment}
        />
      )}
    </main>
  );
}

export default Dashboard;

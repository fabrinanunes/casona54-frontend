import { useEffect, useState } from "react";
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

function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

type DashboardProps = {
  onLogout: () => void;
};

function Dashboard({ onLogout }: DashboardProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    description: "",
    amount: "",
    dueDate: "",
    category: "",
    responsible: "",
  });
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      const response = await fetch("http://localhost:8080/payments", {
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Erro ao buscar pagamentos");
        return;
      }

      const data = await response.json();

      setPayments(data);
      console.log("payments", data);
    };

    fetchPayments();
  }, []);

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
            <strong>
              R${" "}
              {payments
                .reduce((total, payment) => total + payment.amount, 0)
                .toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </strong>
          </div>

          <div className="dashboard__card">
            <span>Pago</span>
            <strong>
              R${" "}
              {payments
                .filter((payment) => payment.status === "paid")
                .reduce((total, payment) => total + payment.amount, 0)
                .toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </strong>
          </div>

          <div className="dashboard__card">
            <span>Pendente</span>
            <strong>
              R${" "}
              {payments
                .filter((payment) => payment.status === "pending")
                .reduce((total, payment) => total + payment.amount, 0)
                .toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </strong>
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

          <div className="dashboard__payments-table-header">
            <span>Descrição</span>
            <span>Valor</span>
            <span>Vencimento</span>
            <span>Status</span>
          </div>

          <div className="dashboard__payments-list">
            {payments.map((payment) => (
              <div key={payment.id}>
                <div>
                  <strong>{payment.description}</strong>
                  <small>{payment.category}</small>
                </div>

                <span>
                  R${" "}
                  {payment.amount.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>

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
                    onClick={() => setEditingPayment(payment)}
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {isPaymentModalOpen && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal__header">
              <div>
                <h2>Novo pagamento</h2>
                <p>Adicione um novo gasto da construção.</p>
              </div>

              <button
                className="payment-modal__close"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form
              className="payment-modal__form"
              onSubmit={async (event) => {
                event.preventDefault();

                const response = await fetch("http://localhost:8080/payments", {
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

                setIsPaymentModalOpen(false);

                const createdPayment = await response.json();

                setPayments((currentPayments) => [
                  ...currentPayments,
                  createdPayment,
                ]);

                setNewPayment({
                  description: "",
                  amount: "",
                  dueDate: "",
                  category: "",
                  responsible: "",
                });
              }}
            >
              <div className="payment-modal__field">
                <label htmlFor="description">Descrição</label>
                <input
                  id="description"
                  type="text"
                  placeholder="Ex: Arquiteto"
                  value={newPayment.description}
                  onChange={(event) =>
                    setNewPayment({
                      ...newPayment,
                      description: event.target.value,
                    })
                  }
                />
              </div>

              <div className="payment-modal__field">
                <label htmlFor="amount">Valor</label>
                <input
                  id="amount"
                  type="number"
                  placeholder="R$ 22.000,00"
                  value={newPayment.amount}
                  onChange={(event) =>
                    setNewPayment({
                      ...newPayment,
                      amount: event.target.value,
                    })
                  }
                />
              </div>

              <div className="payment-modal__field">
                <label htmlFor="dueDate">Vencimento</label>
                <input
                  id="dueDate"
                  type="date"
                  value={newPayment.dueDate}
                  onChange={(event) =>
                    setNewPayment({
                      ...newPayment,
                      dueDate: event.target.value,
                    })
                  }
                />
              </div>

              <div className="payment-modal__field">
                <label htmlFor="category">Categoria</label>
                <input
                  id="category"
                  type="text"
                  placeholder="Ex: Mão de Obra"
                  value={newPayment.category}
                  onChange={(event) =>
                    setNewPayment({
                      ...newPayment,
                      category: event.target.value,
                    })
                  }
                />
              </div>

              <div className="payment-modal__field">
                <label htmlFor="responsible">Responsável</label>
                <input
                  id="responsible"
                  type="text"
                  placeholder="Ex: Fabrina"
                  value={newPayment.responsible}
                  onChange={(event) =>
                    setNewPayment({
                      ...newPayment,
                      responsible: event.target.value,
                    })
                  }
                />
              </div>

              <div className="payment-modal__actions">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                >
                  Cancelar
                </button>

                <button type="submit">Salvar pagamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Dashboard;

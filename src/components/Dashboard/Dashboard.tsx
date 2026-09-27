import { useEffect, useState } from "react";
import PaymentModal, {
  type PaymentFormData,
} from "../PaymentModal/PaymentModal";

import "./Dashboard.css";
import {
  createPayment,
  deletePayment,
  getPayments,
  updatePayment,
  type CreatePaymentData,
  type Payment,
} from "../../services/paymentsService";

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
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    category: "all",
    responsible: "all",
  });
  const [newPayment, setNewPayment] = useState({
    description: "",
    amount: "",
    dueDate: "",
    category: "",
    responsible: "",
  });
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [paymentsError, setPaymentsError] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getPayments();

        setPayments(data);
        setPaymentsError(true);
      } catch (error) {
        console.error("Error fetching payments", error);
      } finally {
        setIsLoadingPayments(false);
      }
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
    const matchesStatus =
      filters.status === "all" || payment.status === filters.status;

    const matchesSearch = payment.description
      .toLowerCase()
      .includes(filters.search.toLowerCase());

    const matchesCategory =
      filters.category === "all" || payment.category === filters.category;

    const matchesResponsible =
      filters.responsible === "all" ||
      payment.responsible === filters.responsible;

    return (
      matchesStatus && matchesSearch && matchesCategory && matchesResponsible
    );
  });

  const handleCreatePayment = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const paymentData: CreatePaymentData = {
      description: newPayment.description,
      amount: Number(newPayment.amount),
      due_date: newPayment.dueDate,
      category: newPayment.category,
      responsible: newPayment.responsible,
      status: "pending",
    };

    try {
      const data = await createPayment(paymentData);

      setPayments((currentPayments) => [...currentPayments, data]);

      setIsPaymentModalOpen(false);

      setNewPayment({
        description: "",
        amount: "",
        dueDate: "",
        category: "",
        responsible: "",
      });
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  const handleUpdatePayment = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (editingPayment === null || editingPaymentId === null) {
      return;
    }

    try {
      const updatedPayment = await updatePayment(editingPaymentId, {
        description: editingPayment.description,
        amount: Number(editingPayment.amount),
        due_date: editingPayment.dueDate,
        category: editingPayment.category,
        responsible: editingPayment.responsible,
        status: editingPayment.status,
      });

      setPayments((currentPayments) =>
        currentPayments.map((payment) =>
          payment.id === updatedPayment.id ? updatedPayment : payment,
        ),
      );

      setEditingPayment(null);
      setEditingPaymentId(null);
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    const payment = payments.find((item) => item.id === paymentId);

    if (!payment) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja excluir o pagamento "${payment.description}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePayment(paymentId);

      setPayments((currentPayments) =>
        currentPayments.filter((item) => item.id !== paymentId),
      );
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  const categories = [...new Set(payments.map((payment) => payment.category))];

  const responsibles = [
    ...new Set(payments.map((payment) => payment.responsible)),
  ].filter(Boolean);

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
              <p>
                {filteredPayments.length}{" "}
                {filteredPayments.length === 1 ? "pagamento" : "pagamentos"}
              </p>
            </div>

            <button onClick={() => setIsPaymentModalOpen(true)}>
              Novo pagamento
            </button>
          </div>

          <div className="dashboard__filters">
            <input
              type="search"
              placeholder="Buscar pagamento..."
              value={filters.search}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  search: event.target.value,
                })
              }
            />

            <select
              value={filters.status}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  status: event.target.value,
                })
              }
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="paid">Pagos</option>
            </select>

            <select
              value={filters.category}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  category: event.target.value,
                })
              }
            >
              <option value="all">Todas as categorias</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filters.responsible}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  responsible: event.target.value,
                })
              }
            >
              <option value="all">Todos os responsáveis</option>

              {responsibles.map((responsible) => (
                <option key={responsible} value={responsible}>
                  {responsible}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() =>
                setFilters({
                  status: "all",
                  search: "",
                  category: "all",
                  responsible: "all",
                })
              }
            >
              Limpar filtros
            </button>
          </div>

          <div className="dashboard__payments-table-header">
            <span>Descrição</span>
            <span>Valor</span>
            <span>Vencimento</span>
            <span>Status</span>
          </div>

          <div className="dashboard__payments-list">
            {isLoadingPayments ? (
              <div className="dashboard__empty">Carregando pagamentos...</div>
            ) : paymentsError ? (
              <div className="dashboard__empty">
                Não foi possível carregar os pagamentos.
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="dashboard__empty">
                {filters.status === "paid"
                  ? "Nenhum pagamento marcado como pago."
                  : filters.status === "pending"
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
                      onClick={() => handleDeletePayment(payment.id)}
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
          onChange={(payment) => setEditingPayment(payment)}
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

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

function Dashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);

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

        <button className="dashboard__logout">Sair</button>
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

            <button>Novo pagamento</button>
          </div>

          <div className="dashboard__payments-list">
            {payments.map((payment) => (
              <div key={payment.id}>
                <strong>{payment.description}</strong>
                <span>
                  R${" "}
                  {payment.amount.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;

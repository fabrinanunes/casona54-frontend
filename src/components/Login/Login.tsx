import { useState } from "react";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event?.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Usuário ou senhha incorretos.");
      }

      console.log("Login realizado com sucesso");
    } catch (error) {
      console.error("Erro ao realizar login:", error);
    }
  };

  return (
    <main className="login">
      <section className="login__container">
        <div className="login__brand">
          <div className="login__icon">⌂</div>

          <h1>Nosso Lar</h1>

          <p>Controle financeiro da nossa construção</p>
        </div>

        <form className="login__form" onSubmit={handleLogin}>
          <div className="login__field">
            <label htmlFor="email">Usuário</label>

            <input
              id="email"
              type="text"
              placeholder="admin"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="login__field">
            <label htmlFor="password">Senha</label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button type="submit">Entrar</button>
        </form>

        <p className="login__footer">
          Área privada • use as credenciais combinadas
        </p>
      </section>
    </main>
  );
}

export default Login;

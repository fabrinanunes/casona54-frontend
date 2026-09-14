import { useState, useEffect } from "react";

import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:8080/check-session", {
          credentials: "include",
        });

        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Dashboard/>;
  }

  return <Login />;
}

export default App;

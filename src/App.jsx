import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NuevaOC from "./pages/NuevaOC";
import Etapa from "./pages/Etapa";
import Pendientes from "./pages/Pendientes";
import Cerradas from "./pages/Cerradas";
import Buscador from "./pages/Buscador";

export default function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <DataProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nueva" element={<NuevaOC />} />
          <Route path="/pendientes" element={<Pendientes />} />
          <Route path="/inicio" element={<Etapa etapa="Inicio" />} />
          <Route path="/seguimiento" element={<Etapa etapa="Seguimiento" />} />
          <Route path="/finalizados" element={<Etapa etapa="Finalizado" />} />
          <Route path="/cerradas" element={<Cerradas />} />
          <Route path="/buscador" element={<Buscador />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </DataProvider>
  );
}

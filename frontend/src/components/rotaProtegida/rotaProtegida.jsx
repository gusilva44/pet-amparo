import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authApi } from "../../services/api";

export default function RotaProtegida({ tiposPermitidos }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function verificarUsuario() {
      try {
        // usuarioAtual ja retorna o corpo da resposta: { usuario }.
        const resposta = await authApi.usuarioAtual();
        if (ativo) setUsuario(resposta.usuario);
      } catch {
        if (ativo) setUsuario(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    verificarUsuario();
    return () => {
      ativo = false;
    };
  }, []);

  if (carregando) {
    return <p>Verificando acesso...</p>;
  }

  if (!usuario) {
    return <Navigate to="/meuspets?modo=login" replace />;
  }

  if (!tiposPermitidos.includes(usuario.tipo)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
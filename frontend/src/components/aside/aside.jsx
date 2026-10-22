import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, clientesApi } from "../../services/api";
import "./aside.scss";

export default function Aside() {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let ativo = true;
    authApi
      .usuarioAtual()
      .then(async ({ usuario }) => {
        let nome = usuario?.nome || "";
        try {
          const perfil = await clientesApi.meusDados();
          nome = perfil.cliente?.nome || nome;
        } catch {
          // O nome da sessão é usado se o perfil não estiver disponível.
        }
        if (ativo) setNomeUsuario(nome);
      })
      .catch(() => {
        if (ativo) setNomeUsuario("");
      });

    return () => {
      ativo = false;
    };
  }, []);

  const iniciais = nomeUsuario
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toLocaleUpperCase("pt-BR"))
    .join("");

  async function sair() {
    try {
      await authApi.logout();
    } finally {
      navigate("/");
    }
  }

  return (
    <div className="comps-aside">
      <div className="usuario">
        <div
          className="img-usuario"
          aria-label={
            nomeUsuario ? `Iniciais de ${nomeUsuario}` : "Perfil do usuário"
          }
        >
          {iniciais || "?"}
        </div>
        <div className="dados-usuario">
          <h2>{nomeUsuario || "Visitante"}</h2>
          <p>Seja bem-vindo(a)</p>
        </div>
      </div>
      <div className="linha" />
      <ul>
        <li>
          <Link to="/">
            <i className="fa-regular fa-house" />
          </Link>
          <Link className="nav" to="/">
            Início
          </Link>
        </li>
        <li>
          <Link to="/meuspets">
            <i className="fa-solid fa-paw" />
          </Link>
          <Link className="nav" to="/meuspets">
            Meus Pets
          </Link>
        </li>
        <li>
          <Link to="/agendamentos">
            <i className="fa-regular fa-calendar" />
          </Link>
          <Link className="nav" to="/agendamentos">
            Agendamentos
          </Link>
        </li>
        <li>
          <i className="fa-solid fa-right-from-bracket" />
          <button type="button" className="nav botao-sair-aside" onClick={sair}>
            Sair
          </button>
        </li>
      </ul>
    </div>
  );
}

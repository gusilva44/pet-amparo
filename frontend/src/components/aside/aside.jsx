  import { useEffect, useState } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import links from "../../data/links";
  import { authApi, clientesApi } from "../../services/api";
  import { avisarMudancaAutenticacao } from "../../utils/authEvents";
  import "./aside.scss";

  export default function Aside({ tipo }) {
    const [nomeUsuario, setNomeUsuario] = useState("");
    const [autenticado, setAutenticado] = useState(false);
    const [tipoUsuario, setTipoUsuario] = useState(tipo || "cliente");
    const linksUsuario = links[tipo || tipoUsuario] || links.cliente;
    const navigate = useNavigate();

    useEffect(() => {
      let ativo = true;

      async function carregarUsuario() {
        try {
          const { usuario } = await authApi.usuarioAtual();
          let nome = usuario?.nome || usuario?.email || "";
          if (ativo) {
            setAutenticado(true);
            setTipoUsuario(usuario?.tipo || "cliente");
          }

          try {
            const perfil = await clientesApi.meusDados();
            nome = perfil.cliente?.nome || nome;
          } catch {
            // Usa o nome da sessao quando o perfil nao estiver disponivel.
          }

          if (ativo) setNomeUsuario(nome);
        } catch {
          if (ativo) {
            setNomeUsuario("");
            setAutenticado(false);
            setTipoUsuario("cliente");
          }
        }
      }

      carregarUsuario();
      window.addEventListener("auth:changed", carregarUsuario);

      return () => {
        ativo = false;
        window.removeEventListener("auth:changed", carregarUsuario);
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
        avisarMudancaAutenticacao();
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
            {!autenticado ? (
              <>
                <button type="button"
                  onClick={() => navigate("/meuspets?modo=login")}
                >Fazer login</button>
                <button type="button"
                  onClick={() => navigate("/meuspets?modo=cadastro")}
                >Cadastrar</button>
              </>
            ) : (
              <>
                <h2>{nomeUsuario}</h2>
                <p>Seja bem-vindo,  {nomeUsuario}</p>
                <h2 style={{ paddingTop: '10px',
                color: "orange"
                }}>{tipoUsuario.toUpperCase()}</h2>
              </>
            )}
          </div>
        </div>
        <div className="linha" />
        <ul>
          {linksUsuario.map((link) => (
          <li key={link.id}>
            <Link to={link.caminho}>
              <i className={link.icone} aria-hidden="true" />
            </Link>
            <Link className="nav" to={link.caminho}>
              {link.texto}
            </Link>
          </li>
        ))}
        {autenticado && (
            <li>
              <i className="fa-solid fa-right-from-bracket" />
              <button type="button" className="nav botao-sair-aside" onClick={sair}>
                Sair
              </button>
            </li>
          )}
        </ul>
      </div>
    );
  }

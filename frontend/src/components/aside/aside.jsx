import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import links from "../../data/links";
import { authApi, clientesApi } from "../../services/api";
import { avisarMudancaAutenticacao } from "../../utils/authEvents";
import "./aside.scss";

import img from '../../assets/imagens/aside_img.webp'

const ROTULOS_TIPO = {
  cliente: "Cliente",
  admin: "Administrador",
  veterinario: "Veterinário"
};

export default function Aside({ tipo }) {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [fotoUsuario, setFotoUsuario] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState(tipo || "cliente");
  const navigate = useNavigate();

  const tipoAtual = tipo || tipoUsuario;
  const linksUsuario = links[tipoAtual] || links.cliente;

  useEffect(() => {
    let ativo = true;

    async function carregarUsuario() {
      try {
        const { usuario } = await authApi.usuarioAtual();

        if (!ativo) return;

        const tipoConta = usuario?.tipo || "cliente";

        setAutenticado(true);
        setTipoUsuario(tipoConta);

        let nome = usuario?.nome || usuario?.email || "";

        if (tipoConta === "cliente") {
          try {
            const perfil = await clientesApi.meusDados();
            nome = perfil.cliente?.nome || nome;
            if (ativo) setFotoUsuario(perfil.cliente?.foto || "");
          } catch {
            nome = usuario?.nome || usuario?.email || "";
            if (ativo) setFotoUsuario("");
          }
        } else if (ativo) {
          setFotoUsuario("");
        }

        if (ativo) setNomeUsuario(nome);
      } catch {
        if (ativo) {
          setNomeUsuario("");
          setAutenticado(false);
          setTipoUsuario("cliente");
          setFotoUsuario("");
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
    <aside className="comps-aside">
      <div className="usuario">
        <div
          className="img-usuario"
          aria-label={nomeUsuario ? `Iniciais de ${nomeUsuario}` : "Perfil do usuário"}
        >
          {fotoUsuario ? <img src={fotoUsuario} alt="" /> : iniciais || <i class="fa-regular fa-user"></i>}
        </div>

        <div className="dados-usuario">
          {!autenticado ? (
            <>
              <button type="button" onClick={() => navigate("/meuspets?modo=login")}>
                Fazer login
              </button>
              <button type="button" onClick={() => navigate("/meuspets?modo=cadastro")}>
                Cadastrar
              </button>
            </>
          ) : (
            <>
              <h2>{nomeUsuario}</h2>
              <span className="tipo-usuario">
                {ROTULOS_TIPO[tipoAtual] || "Cliente"}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="linha" />

      <nav aria-label="Menu principal">
        <ul>
          {linksUsuario.map((link) => (
            <li key={link.id}>
              <Link to={link.caminho} aria-hidden="true" tabIndex={-1}>
                <i className={link.icone} />
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
      </nav>
      <img src={img} alt="Img linda" className="img"/>
    </aside>
  );
}

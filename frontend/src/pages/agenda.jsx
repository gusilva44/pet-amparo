import { useState } from 'react';
import Aside from '../components/aside/aside';
import '../scss/agenda.scss';

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Aside from "../components/aside/aside";
import Logo from "../assets/imagens/Logo.webp";
import { authApi, clientesApi, animaisApi } from "../services/api";
import "../scss/meuspets.scss";
import Auth from "../auth/auth";
import { avisarMudancaAutenticacao } from "../utils/authEvents";

export default function AuthPage() {
const [searchParams] = useSearchParams();
const modoAuth = searchParams.get("modo") === "cadastro" ? "cadastro" : "login";
const [usuario, setUsuario] = useState(null);
const [cliente, setCliente] = useState(null);
const [pets, setPets] = useState([]);
const [carregando, setCarregando] = useState(true);

const carregarDados = useCallback(async (conta) => {
  setUsuario(conta);

  const [resCliente, resPets] = await Promise.allSettled([
    clientesApi.meusDados(),
    animaisApi.listarMeus(),
  ]);

  setCliente(
    resCliente.status === "fulfilled" ? resCliente.value.cliente : null,
  );
  setPets(
    resPets.status === "fulfilled" ? resPets.value.animais || [] : [],
  );
}, []);

useEffect(() => {
  let ativo = true;

  async function verificarSessao() {
    try {
      const resposta = await authApi.usuarioAtual();
      if (ativo) await carregarDados(resposta.usuario);
    } catch {
      if (ativo) {
        setUsuario(null);
        setCliente(null);
        setPets([]);
      }
    } finally {
      if (ativo) setCarregando(false);
    }
  }

  verificarSessao();
  return () => {
    ativo = false;
  };
}, [carregarDados]);

async function autenticar(dadosUsuario) {
  setCarregando(true);
  try {
    await carregarDados(dadosUsuario);
  } finally {
    setCarregando(false);
  }
}

async function sair() {
  try {
    await authApi.logout();
    avisarMudancaAutenticacao();
  } finally {
    setUsuario(null);
    setCliente(null);
    setPets([]);
  }
}

const nomeExibicao = cliente?.nome || usuario?.nome || "";
const iniciaisUsuario = nomeExibicao
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((parte) => parte[0].toLocaleUpperCase("pt-BR"))
  .join("");

if (carregando) {
  return (
    <div className="pages-pets">
      <Aside />
      <main className="main-pets">
        <p className="estado-pets">Carregando...</p>
      </main>
    </div>
  );
}

return (
  <div className="pages-pets">
    <Aside />
    <main className="main-pets">
      <div className="logo">
        <img src={Logo} alt="PetAmparo" />
      </div>

      {!usuario ? (
        <Auth
          key={modoAuth}
          initialMode={modoAuth}
          onAuthenticated={autenticar}
        />
      ) : (
        <></>
      )}
    </main>
  </div>
);
}

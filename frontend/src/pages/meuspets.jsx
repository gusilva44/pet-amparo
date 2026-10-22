import { useEffect, useState } from "react";
import Aside from "../components/aside/aside";
import Logo from "../assets/imagens/Logo.webp";
import CadastroPet from "../components/cadastroPet/cadastroPet";
import { authApi, clientesApi, animaisApi } from "../services/api";
import { mensagemErroApi } from "../utils/api";
import "../scss/meuspets.scss";

const cadastroInicial = {
  nome: "",
  email: "",
  senha: "",
  data_nascimento: "",
  telefone: "",
  cpf: "",
  endereco: "",
};

function extrairMensagem(error) {
  return String(mensagemErroApi(error) || "")
    .replace(/ã/g, "ã")
    .replace(/é/g, "é")
    .replace(/á/g, "á")
    .replace(/ú/g, "ú")
    .replace(/í/g, "í")
    .replace(/ç/g, "ç")
    .replace(/õ/g, "õ");
}

export default function MeusPets() {
  const [usuario, setUsuario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [pets, setPets] = useState([]);
  const [modo, setModo] = useState("login");
  const [emailLogin, setEmailLogin] = useState("");
  const [senhaLogin, setSenhaLogin] = useState("");
  const [cadastro, setCadastro] = useState(cadastroInicial);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const nomeExibicao = cliente?.nome || usuario?.nome || "";
  const iniciaisUsuario = nomeExibicao
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toLocaleUpperCase("pt-BR"))
    .join("");

  async function carregarDados(conta) {
    setUsuario(conta);
    const [resCliente, resPets] = await Promise.allSettled([
      clientesApi.meusDados(),
      animaisApi.listarMeus(),
    ]);
    if (resCliente.status === "fulfilled") setCliente(resCliente.value.cliente);
    if (resPets.status === "fulfilled") setPets(resPets.value.animais || []);
  }

  useEffect(() => {
    let ativo = true;
    authApi
      .usuarioAtual()
      .then(async (res) => {
        if (!ativo) return;
        await carregarDados(res.usuario);
      })
      .catch(() => {
        if (ativo) setUsuario(null);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function entrar(event) {
    event.preventDefault();
    setMensagem("");
    setEnviando(true);
    try {
      const res = await authApi.login({ email: emailLogin, senha: senhaLogin });
      await carregarDados(res.usuario);
    } catch (error) {
      const texto = extrairMensagem(error);
      if (texto.toLowerCase().includes("usuario não encontrado")) {
        setMensagem("Usuario não encontrado");
        setCadastro((atual) => ({ ...atual, email: emailLogin }));
        setModo("cadastro");
      } else {
        setMensagem(texto || "Não foi possível entrar. Confira seus dados.");
      }
    } finally {
      setEnviando(false);
    }
  }

  async function cadastrar(event) {
    event.preventDefault();
    setMensagem("");
    setEnviando(true);
    try {
      await authApi.cadastrar(cadastro);
      const res = await authApi.login({
        email: cadastro.email,
        senha: cadastro.senha,
      });
      await carregarDados(res.usuario);
    } catch (error) {
      setMensagem(
        extrairMensagem(error) || "Não foi possível concluir o cadastro.",
      );
    } finally {
      setEnviando(false);
    }
  }

  async function sair() {
    await authApi.logout();
    setUsuario(null);
    setCliente(null);
    setPets([]);
    setModo("login");
    setMensagem("");
  }

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
          <section className="auth-pets">
            <h1>
              {modo === "login" ? "Acesse sua conta" : "Crie seu cadastro"}
            </h1>
            <p className="auth-intro">
              {modo === "login"
                ? "Entre para acessar seus pets e agendamentos."
                : "Preencha seus dados para criar sua conta e cadastrar seus pets."}
            </p>
            {mensagem && (
              <p className="mensagem-pets" role="alert">
                {mensagem}
              </p>
            )}
            <div className="auth-tabs">
              <button
                type="button"
                className={modo === "login" ? "ativo" : ""}
                onClick={() => {
                  setModo("login");
                  setMensagem("");
                }}
              >
                Entrar
              </button>
              <button
                type="button"
                className={modo === "cadastro" ? "ativo" : ""}
                onClick={() => {
                  setModo("cadastro");
                  setMensagem("");
                }}
              >
                Cadastrar
              </button>
            </div>
            {modo === "login" ? (
              <form className="form-pets" onSubmit={entrar}>
                <label>
                  Email
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={emailLogin}
                    onChange={(e) => setEmailLogin(e.target.value)}
                  />
                </label>
                <label>
                  Senha
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={senhaLogin}
                    onChange={(e) => setSenhaLogin(e.target.value)}
                  />
                </label>
                <button className="botao-principal" disabled={enviando}>
                  {enviando ? "Entrando..." : "Entrar"}
                </button>
              </form>
            ) : (
              <form className="form-pets" onSubmit={cadastrar}>
                <label>
                  Nome completo
                  <input
                    required
                    value={cadastro.nome}
                    onChange={(e) =>
                      setCadastro({ ...cadastro, nome: e.target.value })
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={cadastro.email}
                    onChange={(e) =>
                      setCadastro({ ...cadastro, email: e.target.value })
                    }
                  />
                </label>
                <label>
                  Senha
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength="6"
                    required
                    value={cadastro.senha}
                    onChange={(e) =>
                      setCadastro({ ...cadastro, senha: e.target.value })
                    }
                  />
                </label>
                <label>
                  Data de nascimento
                  <input
                    type="date"
                    required
                    value={cadastro.data_nascimento}
                    onChange={(e) =>
                      setCadastro({
                        ...cadastro,
                        data_nascimento: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Telefone
                  <input
                    type="tel"
                    required
                    value={cadastro.telefone}
                    onChange={(e) =>
                      setCadastro({ ...cadastro, telefone: e.target.value })
                    }
                  />
                </label>
                <label>
                  CPF
                  <input
                    inputMode="numeric"
                    required
                    value={cadastro.cpf}
                    onChange={(e) =>
                      setCadastro({ ...cadastro, cpf: e.target.value })
                    }
                  />
                </label>
                <label>
                  Endereço
                  <input
                    required
                    value={cadastro.endereco}
                    onChange={(e) =>
                      setCadastro({ ...cadastro, endereco: e.target.value })
                    }
                  />
                </label>
                <button className="botao-principal" disabled={enviando}>
                  {enviando ? "Cadastrando..." : "Criar cadastro"}
                </button>
              </form>
            )}
          </section>
        ) : (
          <>
            <section className="meuPerfil">
              <h1>Meu perfil</h1>
              <div className="banner">
                <div className="sta">
                  <div className="avatar-iniciais" aria-label={nomeExibicao}>
                    {iniciaisUsuario || "?"}
                  </div>
                  <div className="infos-pessoais">
                    <h2>{cliente?.nome || usuario.nome || "Minha conta"}</h2>
                    <p>{cliente?.email || usuario.email}</p>
                    {cliente?.telefone && <p>{cliente.telefone}</p>}
                  </div>
                </div>
                <button className="botao-secundario" onClick={sair}>
                  Sair da conta
                </button>
              </div>
            </section>
            <section className="meuspets">
              <div className="pets-cabecalho">
                <div>
                  <h2>Meus pets</h2>
                  <p>Aqui estão os pets cadastrados na sua conta.</p>
                </div>
              </div>
              {pets.length ? (
                <div className="lista-pets">
                  {pets.map((pet) => (
                    <article className="card-pet" key={pet.id_animal}>
                      <h3>{pet.nome}</h3>
                      <p>
                        {[pet.especie, pet.raca].filter(Boolean).join(" · ")}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="estado-pets">
                  Você ainda não cadastrou nenhum pet.
                </p>
              )}
              <CadastroPet onSaved={() => carregarDados(usuario)} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

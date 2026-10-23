import { useState } from "react";
import { authApi } from "../services/api";
import { mensagemErroApi } from "../utils/api";
import { avisarMudancaAutenticacao } from "../utils/authEvents";
import { useNavigate } from "react-router-dom";
import "./auth.scss";



const cadastroInicial = {
  nome: "",
  email: "",
  senha: "",
  data_nascimento: "",
  telefone: "",
  cpf: "",
  endereco: "",
};

/**
 * Formulário reutilizável para entrar ou criar uma conta.
 * onAuthenticated recebe o usuário após o login; a página pode guardá-lo em um state.
 */
export default function Auth({
  onAuthenticated,
  initialMode = "login",
  onCancel,
}) {

  const [modo, setModo] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cadastro, setCadastro] = useState(cadastroInicial);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate()    

  function mudarModo(novoModo) {
    setModo(novoModo);
    setMensagem("");
  }

  async function concluirLogin(dadosLogin) {
    // O cookie de sessão é criado pelo backend. O usuário retornado fica disponível à página.
    const resposta = await authApi.login(dadosLogin);
    avisarMudancaAutenticacao();
    onAuthenticated?.(resposta.usuario);
  }

  async function entrar(event) {
    event.preventDefault();
    setMensagem("");
    setEnviando(true);
    navigate('/')

    try {
      await concluirLogin({ email, senha });
    } catch (error) {
      setMensagem(mensagemErroApi(error) || "Não foi possível entrar.");
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
      await concluirLogin({ email: cadastro.email, senha: cadastro.senha });
    } catch (error) {
      setMensagem(mensagemErroApi(error) || "Não foi possível criar a conta.");
    } finally {
      setEnviando(false);
    }
  }

  function atualizarCadastro(event) {
    const { name, value } = event.target;
    setCadastro((atual) => ({ ...atual, [name]: value }));
  }

  return (
    <section className="auth-pets" aria-labelledby="titulo-autenticacao">
      <h1 id="titulo-autenticacao">
        {modo === "login" ? "Acesse sua conta" : "Crie seu cadastro"}
      </h1>
      <p className="auth-intro">
        {modo === "login"
          ? "Entre para acessar seus pets e agendamentos."
          : "Preencha seus dados para criar sua conta."}
      </p>

      <div className="auth-tabs" aria-label="Tipo de autenticação">
        <button
          type="button"
          className={modo === "login" ? "ativo" : ""}
          onClick={() => mudarModo("login")}
        >
          Entrar
        </button>
        <button
          type="button"
          className={modo === "cadastro" ? "ativo" : ""}
          onClick={() => mudarModo("cadastro")}
        >
          Cadastrar
        </button>
      </div>

      {mensagem && <p className="mensagem-pets" role="alert">{mensagem}</p>}

      {modo === "login" ? (
        <form className="form-pets" onSubmit={entrar}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
            />
          </label>
          <button className="botao-principal" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      ) : (
        <form className="form-pets" onSubmit={cadastrar}>
          <label>Nome completo<input name="nome" required value={cadastro.nome} onChange={atualizarCadastro} /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required value={cadastro.email} onChange={atualizarCadastro} /></label>
          <label>Senha<input name="senha" type="password" autoComplete="new-password" minLength={6} required value={cadastro.senha} onChange={atualizarCadastro} /></label>
          <label>Data de nascimento<input name="data_nascimento" type="date" required value={cadastro.data_nascimento} onChange={atualizarCadastro} /></label>
          <label>Telefone<input name="telefone" type="tel" required value={cadastro.telefone} onChange={atualizarCadastro} /></label>
          <label>CPF<input name="cpf" inputMode="numeric" required value={cadastro.cpf} onChange={atualizarCadastro} /></label>
          <label>Endereço<input name="endereco" required value={cadastro.endereco} onChange={atualizarCadastro} /></label>
          <button className="botao-principal" disabled={enviando}>
            {enviando ? "Cadastrando..." : "Criar cadastro"}
          </button>
        </form>
      )}

      {onCancel && (
        <button type="button" className="auth-cancelar" onClick={onCancel}>
          Fechar
        </button>
      )}
    </section>
  );
}

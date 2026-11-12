import { useState } from "react";
import { authApi } from "../services/api";
import { mensagemErroApi } from "../utils/api";
import { avisarMudancaAutenticacao } from "../utils/authEvents";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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

function somenteNumeros(valor) {
  return valor.replace(/\D/g, "");
}

function formatarCPF(valor) {
  return somenteNumeros(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarTelefone(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (numeros.length <= 2) {
    return numeros.replace(/^(\d{0,2})/, "($1");
  }

  if (numeros.length <= 10) {
    return numeros.replace(
      /^(\d{2})(\d{0,4})(\d{0,4})$/,
      "($1) $2-$3"
    ).replace(/-$/, "");
  }

  return numeros.replace(
    /^(\d{2})(\d{5})(\d{0,4})$/,
    "($1) $2-$3"
  ).replace(/-$/, "");
}

function validarCPF(cpf) {
  const numeros = somenteNumeros(cpf);

  if (numeros.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(numeros)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(numeros[i]) * (10 - i);
  }

  let digito1 = (soma * 10) % 11;
  if (digito1 === 10) digito1 = 0;

  if (digito1 !== Number(numeros[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(numeros[i]) * (11 - i);
  }

  let digito2 = (soma * 10) % 11;
  if (digito2 === 10) digito2 = 0;

  return digito2 === Number(numeros[10]);
}

export default function Auth({
  onAuthenticated,
  initialMode = "login",
  onCancel,
  redirectTo = "/",
}) {
  const [modo, setModo] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cadastro, setCadastro] = useState(cadastroInicial);
  const [enviando, setEnviando] = useState(false);
  const [mostrar, setMostrar] = useState(false);

  const navigate = useNavigate();
  const destino = redirectTo.startsWith("/") && !redirectTo.startsWith("//")
    ? redirectTo
    : "/";

  function mudarModo(novoModo) {
    setModo(novoModo);
    setMostrar(false);
  }

  async function concluirLogin(dadosLogin) {
    const resposta = await authApi.login(dadosLogin);

    avisarMudancaAutenticacao();
    onAuthenticated?.(resposta.usuario);

    return resposta;
  }

  async function entrar(event) {
    event.preventDefault();

    if (enviando) return;

    setEnviando(true);

    try {
      const resposta = await concluirLogin({ email, senha });

      toast.success("Login realizado!", {
        description: "Seja bem-vindo de volta!",
      });

      navigate(redirectTo === "/" ? (resposta.usuario?.tipo === "admin" ? "/visao" : resposta.usuario?.tipo === "veterinario" ? "/admveterinario" : destino) : destino);
    } catch (error) {
      toast.error("Não foi possível entrar", {
        description:
          mensagemErroApi(error) || "Verifique seu email e sua senha.",
      });
    } finally {
      setEnviando(false);
    }
  }

  async function cadastrar(event) {
    event.preventDefault();

    if (enviando) return;

    if (!validarCPF(cadastro.cpf)) {
      toast.error("CPF inválido", {
        description: "Confira os números digitados.",
      });
      return;
    }

    if (somenteNumeros(cadastro.telefone).length < 10) {
      toast.error("Telefone inválido", {
        description: "Informe um telefone com DDD.",
      });
      return;
    }

    setEnviando(true);

    try {
      const dadosCadastro = {
        ...cadastro,
        cpf: somenteNumeros(cadastro.cpf),
        telefone: somenteNumeros(cadastro.telefone),
      };

      await authApi.cadastrar(dadosCadastro);

      const resposta = await concluirLogin({
        email: cadastro.email,
        senha: cadastro.senha,
      });

      toast.success("Conta criada com sucesso!", {
        description: "Bem-vindo à nossa clínica veterinária!",
      });

      navigate(redirectTo === "/" ? (resposta.usuario?.tipo === "admin" ? "/visao" : resposta.usuario?.tipo === "veterinario" ? "/admveterinario" : destino) : destino);
    } catch (error) {
      toast.error("Erro no cadastro", {
        description:
          mensagemErroApi(error) || "Não foi possível criar sua conta.",
      });
    } finally {
      setEnviando(false);
    }
  }

  function atualizarCadastro(event) {
    const { name, value } = event.target;

    let valorFormatado = value;

    if (name === "cpf") {
      valorFormatado = formatarCPF(value);
    }

    if (name === "telefone") {
      valorFormatado = formatarTelefone(value);
    }

    setCadastro((atual) => ({
      ...atual,
      [name]: valorFormatado,
    }));
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

      {modo === "login" ? (
        <form className="form-pets" onSubmit={entrar}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              placeholder="seuemail@email.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="pass">
            Senha
            <input
              type={mostrar ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Sua senha"
              required
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
            />
            <i 
              className={`fa-solid ${mostrar ? "fa-eye-slash" : "fa-eye"} mostrar`}
              onClick={() => setMostrar(!mostrar)}
            ></i>
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
              name="nome"
              placeholder="Digite seu nome completo"
              required
              value={cadastro.nome}
              onChange={atualizarCadastro}
            />
          </label>

          <div className="en">
            <label className="ex">
              Data de nascimento
              <input
                name="data_nascimento"
                type="date"
                required
                value={cadastro.data_nascimento}
                onChange={atualizarCadastro}
              />
            </label>

            <label className="ex">
              CPF
              <input
                name="cpf"
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                maxLength={14}
                required
                value={cadastro.cpf}
                onChange={atualizarCadastro}
              />
            </label>
          </div>

          <label>
            Telefone
            <input
              name="telefone"
              type="text"
              inputMode="tel"
              placeholder="(00) 00000-0000"
              maxLength={15}
              required
              value={cadastro.telefone}
              onChange={atualizarCadastro}
            />
          </label>

          <label>
            Endereço
            <input
              name="endereco"
              placeholder="Rua, número, bairro..."
              required
              value={cadastro.endereco}
              onChange={atualizarCadastro}
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seuemail@email.com"
              required
              value={cadastro.email}
              onChange={atualizarCadastro}
            />
          </label>

          <label className="pass">
            Senha
            <input
              name="senha"
              type={mostrar ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              minLength={6}
              required
              value={cadastro.senha}
              onChange={atualizarCadastro}
            />
            <i 
              className={`fa-solid ${mostrar ? "fa-eye-slash" : "fa-eye"} mostrar`}
              onClick={() => setMostrar(!mostrar)}
            ></i>
          </label>

          <button className="botao-principal" disabled={enviando}>
            {enviando ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>
      )}
    </section>
  );
}

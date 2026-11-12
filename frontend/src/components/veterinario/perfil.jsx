import { useEffect, useState } from "react";
import { authApi, veterinariosApi } from "../../services/api";
import { mensagemErroApi } from "../../utils/api";

const vazio = { nome: "", email: "", crmv: "", especialidade: "", telefone: "" };

export default function PerfilVeterinario() {
  const [perfil, setPerfil] = useState(vazio);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    veterinariosApi.meuPerfil().then((resposta) => setPerfil({ ...vazio, ...resposta.perfil }))
      .catch((error) => setMensagem(mensagemErroApi(error)))
      .finally(() => setCarregando(false));
  }, []);

  async function salvarPerfil(event) {
    event.preventDefault(); setSalvando(true); setMensagem("");
    try {
      const resposta = await veterinariosApi.atualizarMeuPerfil(perfil);
      setPerfil({ ...vazio, ...resposta.perfil });
      setMensagem("Perfil atualizado.");
    } catch (error) { setMensagem(mensagemErroApi(error)); }
    finally { setSalvando(false); }
  }

  async function salvarSenha(event) {
    event.preventDefault(); setMensagem("");
    if (senhaNova !== confirmacao) { setMensagem("A confirmação da senha não confere."); return; }
    setSalvando(true);
    try {
      await authApi.trocarSenha(senhaAtual, senhaNova);
      setSenhaAtual(""); setSenhaNova(""); setConfirmacao("");
      setMensagem("Senha alterada com sucesso.");
    } catch (error) { setMensagem(mensagemErroApi(error)); }
    finally { setSalvando(false); }
  }

  if (carregando) return <section><p>Carregando perfil...</p></section>;
  return <section className="perfil-veterinario">
    <header><h2>Meu perfil</h2><p>Atualize seus dados profissionais e de acesso.</p></header>
    <form onSubmit={salvarPerfil}>
      <label>Nome completo<input required maxLength="150" value={perfil.nome} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} /></label>
      <label>E-mail<input required type="email" value={perfil.email} onChange={(e) => setPerfil({ ...perfil, email: e.target.value })} /></label>
      <label>CRMV<input required maxLength="30" value={perfil.crmv} onChange={(e) => setPerfil({ ...perfil, crmv: e.target.value })} /></label>
      <label>Especialidade<input maxLength="150" value={perfil.especialidade || ""} onChange={(e) => setPerfil({ ...perfil, especialidade: e.target.value })} /></label>
      <label>Telefone<input type="tel" maxLength="30" value={perfil.telefone || ""} onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })} /></label>
      <button disabled={salvando}>{salvando ? "Salvando..." : "Salvar perfil"}</button>
    </form>
    <form onSubmit={salvarSenha}>
      <h3>Alterar senha</h3>
      <label>Senha atual<input required type="password" autoComplete="current-password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} /></label>
      <label>Nova senha<input required type="password" minLength="6" autoComplete="new-password" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} /></label>
      <label>Confirme a nova senha<input required type="password" minLength="6" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} /></label>
      <button disabled={salvando}>{salvando ? "Salvando..." : "Alterar senha"}</button>
    </form>
    {mensagem && <p role="status">{mensagem}</p>}
  </section>;
}

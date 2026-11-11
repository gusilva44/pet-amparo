import { useCallback, useEffect, useMemo, useState } from "react";
import Aside from "../../aside/aside";
import { unidadesApi, veterinariosApi } from "../../../services/api";
import { mensagemErroApi } from "../../../utils/api";
import "./veterinarios.scss";

const formularioInicial = {
  nome: "",
  email: "",
  senha: "",
  crmv: "",
  especialidade: "",
  telefone: "",
  id_unidade: "",
};
const fichaInicial = { id_usuario: "", nome: "", crmv: "", especialidade: "", telefone: "", id_unidade: "" };

export default function VeterinariosAdmin() {
  const [veterinarios, setVeterinarios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [ficha, setFicha] = useState(fichaInicial);
  const [contasSemFicha, setContasSemFicha] = useState([]);
  const [unidadeExtra, setUnidadeExtra] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [resVets, resContas, resUnidades] = await Promise.all([
        veterinariosApi.listarAdmin(),
        veterinariosApi.contasSemFicha(),
        unidadesApi.listar(true),
      ]);
      setVeterinarios(resVets.resultado || []);
      setContasSemFicha(resContas.resultado || []);
      setUnidades((resUnidades.resultado || []).filter((unidade) => unidade.ativo));
      setMensagem("");
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const grupos = useMemo(() => {
    const porId = new Map();
    for (const veterinario of veterinarios) {
      const id = String(veterinario.id_veterinario);
      if (!porId.has(id)) porId.set(id, { ...veterinario, unidades: [] });
      if (veterinario.id_unidade) {
        porId.get(id).unidades.push({ id: veterinario.id_unidade, nome: veterinario.unidade_nome });
      }
    }
    return [...porId.values()];
  }, [veterinarios]);

  async function cadastrar(event) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    try {
      await veterinariosApi.criar({ ...formulario, id_unidade: Number(formulario.id_unidade) });
      setFormulario(formularioInicial);
      setMensagem("Veterinário cadastrado. Ele já pode entrar e configurar os horários de atendimento.");
      await carregar();
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setSalvando(false);
    }
  }

  async function vincularUnidade(idVeterinario) {
    const idUnidade = Number(unidadeExtra[idVeterinario]);
    if (!idUnidade) return;
    setMensagem("");
    try {
      await veterinariosApi.vincularUnidade(idVeterinario, idUnidade);
      setMensagem("Unidade vinculada ao veterinário.");
      setUnidadeExtra((atual) => ({ ...atual, [idVeterinario]: "" }));
      await carregar();
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    }
  }

  async function completarFicha(event) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    try {
      await veterinariosApi.criarFichaConta(Number(ficha.id_usuario), { ...ficha, id_unidade: Number(ficha.id_unidade) });
      setFicha(fichaInicial);
      setMensagem("Ficha profissional criada para a conta existente.");
      await carregar();
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="pagina-admin-veterinarios">
      <Aside />
      <main className="conteudo-admin-veterinarios">
        <header>
          <span className="eyebrow-admin-veterinarios">EQUIPE CLÍNICA</span>
          <h1>Veterinários</h1>
          <p>Cadastre os profissionais, escolha as unidades onde atendem e peça que configurem seus horários.</p>
        </header>

        {mensagem && <p className="mensagem-admin-veterinarios" role="status">{mensagem}</p>}

        <section className="cadastro-admin-veterinario">
          <h2>Cadastrar profissional</h2>
          <form onSubmit={cadastrar}>
            <label>Nome completo<input required maxLength="150" value={formulario.nome} onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })} /></label>
            <label>E-mail de acesso<input required type="email" autoComplete="email" value={formulario.email} onChange={(e) => setFormulario({ ...formulario, email: e.target.value })} /></label>
            <label>Senha inicial<input required type="password" minLength="6" autoComplete="new-password" value={formulario.senha} onChange={(e) => setFormulario({ ...formulario, senha: e.target.value })} /></label>
            <label>CRMV<input required maxLength="30" value={formulario.crmv} onChange={(e) => setFormulario({ ...formulario, crmv: e.target.value })} /></label>
            <label>Especialidade<input maxLength="150" value={formulario.especialidade} onChange={(e) => setFormulario({ ...formulario, especialidade: e.target.value })} /></label>
            <label>Telefone<input type="tel" maxLength="30" value={formulario.telefone} onChange={(e) => setFormulario({ ...formulario, telefone: e.target.value })} /></label>
            <label>Unidade inicial<select required value={formulario.id_unidade} onChange={(e) => setFormulario({ ...formulario, id_unidade: e.target.value })}><option value="">Selecione uma unidade</option>{unidades.map((unidade) => <option key={unidade.id_unidade} value={unidade.id_unidade}>{unidade.nome}</option>)}</select></label>
            <button type="submit" disabled={salvando || !unidades.length}>{salvando ? "Cadastrando..." : "Cadastrar veterinário"}</button>
          </form>
        </section>

        {contasSemFicha.length > 0 && <section className="cadastro-admin-veterinario">
          <h2>Completar conta veterinária existente</h2>
          <p>Use esta opção para associar uma ficha profissional a uma conta que já pode entrar no sistema.</p>
          <form onSubmit={completarFicha}>
            <label>Conta sem ficha<select required value={ficha.id_usuario} onChange={(e) => setFicha({ ...ficha, id_usuario: e.target.value })}><option value="">Selecione uma conta</option>{contasSemFicha.map((conta) => <option key={conta.id_usuario} value={conta.id_usuario}>{conta.email}</option>)}</select></label>
            <label>Nome completo<input required maxLength="150" value={ficha.nome} onChange={(e) => setFicha({ ...ficha, nome: e.target.value })} /></label>
            <label>CRMV<input required maxLength="30" value={ficha.crmv} onChange={(e) => setFicha({ ...ficha, crmv: e.target.value })} /></label>
            <label>Especialidade<input maxLength="150" value={ficha.especialidade} onChange={(e) => setFicha({ ...ficha, especialidade: e.target.value })} /></label>
            <label>Telefone<input type="tel" maxLength="30" value={ficha.telefone} onChange={(e) => setFicha({ ...ficha, telefone: e.target.value })} /></label>
            <label>Unidade inicial<select required value={ficha.id_unidade} onChange={(e) => setFicha({ ...ficha, id_unidade: e.target.value })}><option value="">Selecione uma unidade</option>{unidades.map((unidade) => <option key={unidade.id_unidade} value={unidade.id_unidade}>{unidade.nome}</option>)}</select></label>
            <button type="submit" disabled={salvando || !unidades.length || !ficha.id_usuario}>{salvando ? "Salvando..." : "Criar ficha profissional"}</button>
          </form>
        </section>}

        <section className="lista-admin-veterinarios">
          <div className="lista-admin-veterinarios-titulo"><h2>Profissionais cadastrados</h2><button type="button" onClick={carregar} disabled={carregando}>{carregando ? "Atualizando..." : "Atualizar lista"}</button></div>
          {carregando ? <p>Carregando profissionais...</p> : grupos.length ? grupos.map((veterinario) => {
            const unidadesVinculadas = new Set(veterinario.unidades.map((unidade) => String(unidade.id)));
            const disponiveis = unidades.filter((unidade) => !unidadesVinculadas.has(String(unidade.id_unidade)));
            return <article className="linha-admin-veterinario" key={veterinario.id_veterinario}>
              <div><strong>{veterinario.nome}</strong><span>{veterinario.crmv}{veterinario.especialidade ? ` · ${veterinario.especialidade}` : ""}</span><small>{veterinario.email}</small></div>
              <div className="unidades-admin-veterinario"><strong>Unidades</strong><span>{veterinario.unidades.map((unidade) => unidade.nome || `Unidade ${unidade.id}`).join(", ") || "Nenhuma"}</span></div>
              {disponiveis.length > 0 && <div className="vincular-admin-veterinario"><select aria-label={`Vincular outra unidade a ${veterinario.nome}`} value={unidadeExtra[veterinario.id_veterinario] || ""} onChange={(e) => setUnidadeExtra({ ...unidadeExtra, [veterinario.id_veterinario]: e.target.value })}><option value="">Outra unidade...</option>{disponiveis.map((unidade) => <option key={unidade.id_unidade} value={unidade.id_unidade}>{unidade.nome}</option>)}</select><button type="button" onClick={() => vincularUnidade(veterinario.id_veterinario)} disabled={!unidadeExtra[veterinario.id_veterinario]}>Vincular</button></div>}
            </article>;
          }) : <p>Nenhum veterinário cadastrado ainda.</p>}
        </section>
      </main>
    </div>
  );
}

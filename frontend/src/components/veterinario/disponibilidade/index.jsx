import { useCallback, useEffect, useState } from "react";
import { unidadesApi, veterinariosApi } from "../../../services/api";
import { mensagemErroApi } from "../../../utils/api";
import "./index.scss";

export default function DisponibilidadeVeterinario() {
  const [unidades, setUnidades] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [catalogoUnidades, setCatalogoUnidades] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [form, setForm] = useState({ id_unidade: "", data: "", hora_inicio: "09:00", hora_fim: "17:00", ids_servicos: [] });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [resUnidades, resHorarios, resCatalogo] = await Promise.all([
        veterinariosApi.minhasUnidades(),
        veterinariosApi.meusHorarios(),
        unidadesApi.listarPublicasComServicos(),
      ]);
      const listaUnidades = resUnidades.resultado || [];
      setUnidades(listaUnidades);
      setHorarios(resHorarios.resultado || []);
      const catalogo = resCatalogo.resultado || [];
      setCatalogoUnidades(catalogo);
      setForm((atual) => ({ ...atual, id_unidade: atual.id_unidade || String(listaUnidades[0]?.id_unidade || "") }));
      setMensagem("");
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const unidade = catalogoUnidades.find((item) => Number(item.id_unidade) === Number(form.id_unidade));
    setServicos(unidade?.servicos || []);
    setForm((atual) => ({ ...atual, ids_servicos: atual.ids_servicos.filter((id) => (unidade?.servicos || []).some((servico) => String(servico.id_servico) === id)) }));
  }, [catalogoUnidades, form.id_unidade]);

  useEffect(() => { carregar(); }, [carregar]);

  async function salvar(event) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    try {
      await veterinariosApi.criarMeuHorario({
        ...form,
        id_unidade: Number(form.id_unidade),
        dia_semana: ((new Date(`${form.data}T12:00:00`).getDay() + 6) % 7) + 1,
        ids_servicos: form.ids_servicos.map(Number),
      });
      await carregar();
      setMensagem("Disponibilidade adicionada.");
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id) {
    setRemovendo(id);
    setMensagem("");
    try {
      await veterinariosApi.excluirMeuHorario(id);
      setHorarios((atuais) => atuais.filter((horario) => horario.id_horario !== id));
      setMensagem("Disponibilidade removida.");
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setRemovendo(null);
    }
  }

  return (
    <section className="disponibilidade-veterinario">
      <header>
        <h2>Minha disponibilidade</h2>
        <p>Defina em quais dias, horários e unidades os clientes podem marcar consultas com você.</p>
      </header>

      {unidades.length === 0 && !carregando ? (
        <p className="disponibilidade-vazia">Você ainda não está vinculado a uma unidade. Peça ao administrador para associar seu cadastro a uma unidade.</p>
      ) : (
        <form className="form-disponibilidade" onSubmit={salvar}>
          <label>Unidade
            <select required value={form.id_unidade} onChange={(event) => setForm({ ...form, id_unidade: event.target.value })}>
              {unidades.map((unidade) => <option key={unidade.id_unidade} value={unidade.id_unidade}>{unidade.nome}</option>)}
            </select>
          </label>
          <label>Data disponível
            <input type="date" required value={form.data} min={new Date().toLocaleDateString("en-CA")} onChange={(event) => setForm({ ...form, data: event.target.value })} />
          </label>
          <label>Início <input type="time" required value={form.hora_inicio} onChange={(event) => setForm({ ...form, hora_inicio: event.target.value })} /></label>
          <label>Fim <input type="time" required value={form.hora_fim} onChange={(event) => setForm({ ...form, hora_fim: event.target.value })} /></label>
          <fieldset className="servicos-disponibilidade">
            <legend>Serviços que atenderá nesta data</legend>
            {servicos.map((servico) => <label key={servico.id_servico} className="servico-opcao"><input type="checkbox" checked={form.ids_servicos.includes(String(servico.id_servico))} onChange={(event) => setForm((atual) => ({ ...atual, ids_servicos: event.target.checked ? [...atual.ids_servicos, String(servico.id_servico)] : atual.ids_servicos.filter((id) => id !== String(servico.id_servico)) }))} />{servico.nome}</label>)}
          </fieldset>
          <button type="submit" disabled={salvando || carregando || !unidades.length || !form.ids_servicos.length}>{salvando ? "Salvando..." : "Adicionar horário"}</button>
        </form>
      )}

      {mensagem && <p className="mensagem-disponibilidade" role="status">{mensagem}</p>}

      <div className="lista-disponibilidade">
        <h3>Horários cadastrados</h3>
        {carregando ? <p>Carregando disponibilidade...</p> : horarios.length === 0 ? <p>Nenhum dia ou horário cadastrado.</p> : horarios.map((horario) => (
          <article key={horario.id_horario}>
            <div><strong>{horario.data_disponivel ? new Date(`${horario.data_disponivel instanceof Date ? horario.data_disponivel.toISOString().slice(0, 10) : String(horario.data_disponivel).slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) : "Disponibilidade recorrente"}</strong><span>{horario.unidade_nome || unidades.find((unidade) => Number(unidade.id_unidade) === Number(horario.id_unidade))?.nome}</span><span>{horario.servicos_nomes || "Todos os serviços"}</span></div>
            <time>{String(horario.hora_inicio).slice(0, 5)}–{String(horario.hora_fim).slice(0, 5)}</time>
            <button type="button" onClick={() => excluir(horario.id_horario)} disabled={removendo === horario.id_horario} aria-label="Remover horário">{removendo === horario.id_horario ? "Removendo..." : "Remover"}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

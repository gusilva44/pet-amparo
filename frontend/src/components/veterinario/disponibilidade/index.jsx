import { useCallback, useEffect, useState } from "react";
import { veterinariosApi } from "../../../services/api";
import { mensagemErroApi } from "../../../utils/api";
import "./index.scss";

const DIAS = [
  [1, "Segunda-feira"], [2, "Terça-feira"], [3, "Quarta-feira"],
  [4, "Quinta-feira"], [5, "Sexta-feira"], [6, "Sábado"], [7, "Domingo"],
];

export default function DisponibilidadeVeterinario() {
  const [unidades, setUnidades] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [form, setForm] = useState({ id_unidade: "", dia_semana: "1", hora_inicio: "09:00", hora_fim: "17:00" });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [resUnidades, resHorarios] = await Promise.all([
        veterinariosApi.minhasUnidades(),
        veterinariosApi.meusHorarios(),
      ]);
      const listaUnidades = resUnidades.resultado || [];
      setUnidades(listaUnidades);
      setHorarios(resHorarios.resultado || []);
      setForm((atual) => ({ ...atual, id_unidade: atual.id_unidade || String(listaUnidades[0]?.id_unidade || "") }));
      setMensagem("");
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function salvar(event) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    try {
      await veterinariosApi.criarMeuHorario({
        ...form,
        id_unidade: Number(form.id_unidade),
        dia_semana: Number(form.dia_semana),
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
          <label>Dia da semana
            <select required value={form.dia_semana} onChange={(event) => setForm({ ...form, dia_semana: event.target.value })}>
              {DIAS.map(([dia, nome]) => <option key={dia} value={dia}>{nome}</option>)}
            </select>
          </label>
          <label>Início <input type="time" required value={form.hora_inicio} onChange={(event) => setForm({ ...form, hora_inicio: event.target.value })} /></label>
          <label>Fim <input type="time" required value={form.hora_fim} onChange={(event) => setForm({ ...form, hora_fim: event.target.value })} /></label>
          <button type="submit" disabled={salvando || carregando || !unidades.length}>{salvando ? "Salvando..." : "Adicionar horário"}</button>
        </form>
      )}

      {mensagem && <p className="mensagem-disponibilidade" role="status">{mensagem}</p>}

      <div className="lista-disponibilidade">
        <h3>Horários cadastrados</h3>
        {carregando ? <p>Carregando disponibilidade...</p> : horarios.length === 0 ? <p>Nenhum dia ou horário cadastrado.</p> : horarios.map((horario) => (
          <article key={horario.id_horario}>
            <div><strong>{DIAS.find(([dia]) => dia === Number(horario.dia_semana))?.[1]}</strong><span>{horario.unidade_nome || unidades.find((unidade) => Number(unidade.id_unidade) === Number(horario.id_unidade))?.nome}</span></div>
            <time>{String(horario.hora_inicio).slice(0, 5)}–{String(horario.hora_fim).slice(0, 5)}</time>
            <button type="button" onClick={() => excluir(horario.id_horario)} disabled={removendo === horario.id_horario} aria-label="Remover horário">{removendo === horario.id_horario ? "Removendo..." : "Remover"}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

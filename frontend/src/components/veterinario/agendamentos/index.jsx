import { useMemo, useState } from "react";
import { chaveDoDia, chaveDoMes, ehHoje, formatarDataCurta, mesAtual, rotuloDoDia } from "../../../utils/data";
import CartaoAgendamento from "./cartaoAgendamento";
import "./index.scss";

const FILTROS_SITUACAO = [
    { valor: "todas", rotulo: "Todas as situações" },
    { valor: "pendente", rotulo: "Pendentes" },
    { valor: "concluido", rotulo: "Concluídos" }
];

const FILTROS_PERIODO = [
    { valor: "todos", rotulo: "Todo o histórico" },
    { valor: "futuros", rotulo: "A partir de hoje" },
    { valor: "hoje", rotulo: "Somente hoje" },
    { valor: "mes", rotulo: "Mês atual" }
];

function agruparPorDia(agendamentos) {
    const mapa = new Map();

    agendamentos.forEach((agendamento) => {
        const chave = chaveDoDia(agendamento.inicio);

        if (!mapa.has(chave)) {
            mapa.set(chave, { chave, inicio: agendamento.inicio, itens: [] });
        }

        mapa.get(chave).itens.push(agendamento);
    });

    return [...mapa.values()];
}

export default function AgendamentosVeterinario({
    agendamentos,
    carregando,
    mensagem,
    atualizandoId,
    alterarSituacao,
    recarregar,
    limparMensagem
}) {
    const [pesquisa, setPesquisa] = useState("");
    const [situacao, setSituacao] = useState("todas");
    const [periodo, setPeriodo] = useState("futuros");

    const hoje = chaveDoDia(new Date());
    const mes = mesAtual();

    const quantidade = useMemo(() => ({
        total: agendamentos.length,
        pendentes: agendamentos.filter((item) => item.situacao === "pendente").length,
        concluidos: agendamentos.filter((item) => item.situacao === "concluido").length,
        hoje: agendamentos.filter((item) => chaveDoDia(item.inicio) === hoje).length
    }), [agendamentos, hoje]);

    const filtrados = useMemo(() => {
        const termo = pesquisa.trim().toLowerCase();

        return agendamentos
            .filter((item) => {
                const correspondePesquisa =
                    !termo ||
                    String(item.animal || "").toLowerCase().includes(termo) ||
                    String(item.cliente || "").toLowerCase().includes(termo) ||
                    String(item.servico || "").toLowerCase().includes(termo);

                const correspondeSituacao =
                    situacao === "todas" || item.situacao === situacao;

                const chave = chaveDoDia(item.inicio);

                const correspondePeriodo =
                    periodo === "todos" ||
                    (periodo === "hoje" && chave === hoje) ||
                    (periodo === "mes" && chaveDoMes(item.inicio) === mes) ||
                    (periodo === "futuros" && chave >= hoje);

                return correspondePesquisa && correspondeSituacao && correspondePeriodo;
            })
            .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    }, [agendamentos, pesquisa, situacao, periodo, hoje, mes]);

    const dias = useMemo(() => agruparPorDia(filtrados), [filtrados]);

    return (
        <section className="atendimentos">
            <div className="resumo-atendimentos">
                <div className="indicador">
                    <div className="icone verde">
                        <i className="fa-regular fa-calendar-check"></i>
                    </div>
                    <div>
                        <p>Total de atendimentos</p>
                        <h2>{quantidade.total}</h2>
                    </div>
                </div>

                <div className="indicador">
                    <div className="icone amarelo">
                        <i className="fa-regular fa-hourglass-half"></i>
                    </div>
                    <div>
                        <p>Pendentes</p>
                        <h2>{quantidade.pendentes}</h2>
                    </div>
                </div>

                <div className="indicador">
                    <div className="icone azul">
                        <i className="fa-solid fa-check-double"></i>
                    </div>
                    <div>
                        <p>Concluídos</p>
                        <h2>{quantidade.concluidos}</h2>
                    </div>
                </div>

                <div className="indicador">
                    <div className="icone laranja">
                        <i className="fa-solid fa-clock"></i>
                    </div>
                    <div>
                        <p>Hoje</p>
                        <h2>{quantidade.hoje}</h2>
                    </div>
                </div>
            </div>

            <div className="barra-filtros">
                <div className="campo-busca">
                    <i className="fa-solid fa-magnifying-glass"></i>

                    <input
                        type="text"
                        placeholder="Buscar por pet, tutor ou procedimento..."
                        value={pesquisa}
                        onChange={(event) => setPesquisa(event.target.value)}
                    />
                </div>

                <select value={situacao} onChange={(event) => setSituacao(event.target.value)}>
                    {FILTROS_SITUACAO.map((opcao) => (
                        <option key={opcao.valor} value={opcao.valor}>
                            {opcao.rotulo}
                        </option>
                    ))}
                </select>

                <select value={periodo} onChange={(event) => setPeriodo(event.target.value)}>
                    {FILTROS_PERIODO.map((opcao) => (
                        <option key={opcao.valor} value={opcao.valor}>
                            {opcao.rotulo}
                        </option>
                    ))}
                </select>

                <button type="button" className="atualizar" onClick={recarregar}>
                    <i className={`fa-solid fa-rotate ${carregando ? "fa-spin" : ""}`}></i>
                    Atualizar
                </button>
            </div>

            {mensagem && (
                <div className="mensagem-erro">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{mensagem}</span>

                    <button type="button" onClick={limparMensagem} aria-label="Fechar mensagem">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {carregando ? (
                <div className="estado">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <p>Carregando seus atendimentos...</p>
                </div>
            ) : dias.length === 0 ? (
                <div className="estado">
                    <i className="fa-regular fa-calendar-xmark"></i>
                    <p>Nenhum atendimento encontrado com esses filtros.</p>
                </div>
            ) : (
                dias.map((dia) => (
                    <div className="grupo-dia" key={dia.chave}>
                        <header className="cabecalho-dia">
                            <h3>
                                {rotuloDoDia(dia.inicio)}
                                {ehHoje(dia.inicio) && <span className="selo-hoje">Hoje</span>}
                            </h3>

                            <span className="contagem-dia">
                                {dia.itens.length} {dia.itens.length === 1 ? "atendimento" : "atendimentos"}
                                <small>{formatarDataCurta(dia.inicio)}</small>
                            </span>
                        </header>

                        <div className="lista-cartoes">
                            {dia.itens.map((agendamento) => (
                                <CartaoAgendamento
                                    key={agendamento.id_agendamento}
                                    agendamento={agendamento}
                                    atualizando={atualizandoId === agendamento.id_agendamento}
                                    onAlterarSituacao={alterarSituacao}
                                    destacarDia={hoje}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </section>
    );
}

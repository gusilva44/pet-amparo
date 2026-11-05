import { useMemo, useState } from "react";
import {
    chaveDoDia,
    chaveDoMes,
    diasDoMes,
    ehHoje,
    formatarHora,
    mesAtual,
    primeiroDiaSemana,
    rotuloDoDia,
    rotuloDoMes,
    somarMeses
} from "../../../utils/data";
import CartaoAgendamento from "../agendamentos/cartaoAgendamento";
import "./index.scss";

const DIAS_CABECALHO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MAXIMO_EVENTOS_VISIVEIS = 3;

export default function AgendaVeterinario({
    agendamentos,
    carregando,
    atualizandoId,
    alterarSituacao
}) {
    const [mes, setMes] = useState(mesAtual());
    const [diaSelecionado, setDiaSelecionado] = useState(chaveDoDia(new Date()));

    const agendamentosDoMes = useMemo(() => {
        return agendamentos
            .filter((item) => chaveDoMes(item.inicio) === mes)
            .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    }, [agendamentos, mes]);

    const porDia = useMemo(() => {
        const mapa = new Map();

        agendamentosDoMes.forEach((item) => {
            const chave = chaveDoDia(item.inicio);

            if (!mapa.has(chave)) mapa.set(chave, []);

            mapa.get(chave).push(item);
        });

        return mapa;
    }, [agendamentosDoMes]);

    const resumo = useMemo(() => ({
        total: agendamentosDoMes.length,
        pendentes: agendamentosDoMes.filter((item) => item.situacao === "pendente").length,
        concluidos: agendamentosDoMes.filter((item) => item.situacao === "concluido").length
    }), [agendamentosDoMes]);

    const dias = useMemo(() => diasDoMes(mes), [mes]);
    const espacosIniciais = useMemo(() => primeiroDiaSemana(mes), [mes]);

    const doDiaSelecionado = useMemo(() => {
        return (porDia.get(diaSelecionado) || []).slice();
    }, [porDia, diaSelecionado]);

    const referenciaDia = `${diaSelecionado}T12:00:00`;

    function irParaHoje() {
        const atual = mesAtual();
        setMes(atual);
        setDiaSelecionado(chaveDoDia(new Date()));
    }

    return (
        <section className="agenda-mensal">
            <div className="controles-mes">
                <div className="navegacao">
                    <button
                        type="button"
                        onClick={() => setMes(somarMeses(mes, -1))}
                        aria-label="Mês anterior"
                    >
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>

                    <h2>{rotuloDoMes(mes)}</h2>

                    <button
                        type="button"
                        onClick={() => setMes(somarMeses(mes, 1))}
                        aria-label="Próximo mês"
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>

                    <button type="button" className="hoje" onClick={irParaHoje}>
                        Hoje
                    </button>
                </div>

                <div className="resumo-mes">
                    <span><strong>{resumo.total}</strong> atendimentos</span>
                    <span className="pendente"><strong>{resumo.pendentes}</strong> pendentes</span>
                    <span className="concluido"><strong>{resumo.concluidos}</strong> concluídos</span>
                </div>
            </div>

            <div className="calendario">
                <div className="cabecalho-semana">
                    {DIAS_CABECALHO.map((dia) => (
                        <span key={dia}>{dia}</span>
                    ))}
                </div>

                <div className="grade-dias">
                    {Array.from({ length: espacosIniciais }).map((_, indice) => (
                        <div className="celula vazia" key={`vazio-${indice}`} />
                    ))}

                    {dias.map((dia) => {
                        const itens = porDia.get(dia.chave) || [];
                        const visiveis = itens.slice(0, MAXIMO_EVENTOS_VISIVEIS);
                        const excedente = itens.length - visiveis.length;
                        const pendentes = itens.filter(
                            (item) => item.situacao === "pendente"
                        ).length;

                        const classes = [
                            "celula",
                            ehHoje(dia.chave) ? "hoje" : "",
                            diaSelecionado === dia.chave ? "selecionado" : "",
                            itens.length > 0 ? "com-atendimento" : ""
                        ].filter(Boolean).join(" ");

                        return (
                            <button
                                type="button"
                                className={classes}
                                key={dia.chave}
                                onClick={() => setDiaSelecionado(dia.chave)}
                            >
                                <div className="topo-celula">
                                    <span className="numero-dia">{dia.dia}</span>

                                    {pendentes > 0 && (
                                        <span className="marcador-pendente" title={`${pendentes} pendentes`}>
                                            {pendentes}
                                        </span>
                                    )}
                                </div>

                                <div className="eventos">
                                    {visiveis.map((item) => (
                                        <span
                                            className={`evento ${item.situacao}`}
                                            key={item.id_agendamento}
                                            title={`${formatarHora(item.inicio)} · ${item.animal}`}
                                        >
                                            <i className="fa-solid fa-circle"></i>
                                            {formatarHora(item.inicio)} {item.animal}
                                        </span>
                                    ))}

                                    {excedente > 0 && (
                                        <span className="mais-eventos">+{excedente} outros</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="detalhe-dia">
                <header>
                    <h3>{rotuloDoDia(referenciaDia)}</h3>
                    <span>
                        {doDiaSelecionado.length}{" "}
                        {doDiaSelecionado.length === 1 ? "atendimento" : "atendimentos"}
                    </span>
                </header>

                {carregando ? (
                    <div className="estado-dia">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <p>Carregando agenda...</p>
                    </div>
                ) : doDiaSelecionado.length === 0 ? (
                    <div className="estado-dia">
                        <i className="fa-regular fa-calendar"></i>
                        <p>Nenhum atendimento marcado para este dia.</p>
                    </div>
                ) : (
                    <div className="lista-dia">
                        {doDiaSelecionado.map((agendamento) => (
                            <CartaoAgendamento
                                key={agendamento.id_agendamento}
                                agendamento={agendamento}
                                atualizando={atualizandoId === agendamento.id_agendamento}
                                onAlterarSituacao={alterarSituacao}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

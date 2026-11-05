import { useCallback, useEffect, useMemo, useState } from "react";
import { relatoriosApi } from "../../../services/api";
import { mensagemErroApi } from "../../../utils/api";
import Aside from "../../aside/aside";
import GraficoColunas from "./graficoColunas";
import "./relatorios.scss";

const PERIODOS = [
    { valor: 1, rotulo: "Último mês" },
    { valor: 3, rotulo: "Últimos 3 meses" },
    { valor: 6, rotulo: "Últimos 6 meses" },
    { valor: 12, rotulo: "Últimos 12 meses" }
];

const STATUS_ROTULOS = {
    agendado: "Agendado",
    confirmado: "Confirmado",
    em_atendimento: "Em atendimento",
    concluido: "Concluído",
    cancelado: "Cancelado"
};

const MESES_CURTOS = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez"
];

function formatarData(valor) {
    if (!valor) return "—";

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "—";

    const dia = String(data.getDate()).padStart(2, "0");
    const mes = MESES_CURTOS[data.getMonth()];
    const hora = String(data.getHours()).padStart(2, "0");
    const minuto = String(data.getMinutes()).padStart(2, "0");

    return `${dia} ${mes} · ${hora}:${minuto}`;
}

function formatarNumero(valor) {
    return new Intl.NumberFormat("pt-BR").format(Number(valor) || 0);
}

function percentual(parte, total) {
    if (!total) return 0;
    return Math.round((Number(parte) / Number(total)) * 100);
}

export default function Relatorios() {
    const [relatorio, setRelatorio] = useState(null);
    const [periodo, setPeriodo] = useState(6);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState("");

    const carregarRelatorio = useCallback(async (meses) => {
        try {
            setCarregando(true);
            setMensagem("");

            const resposta = await relatoriosApi.obter(meses);
            setRelatorio(resposta?.resultado || null);
        } catch (error) {
            setMensagem(mensagemErroApi(error));
            setRelatorio(null);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarRelatorio(periodo);
    }, [carregarRelatorio, periodo]);

    const resumo = relatorio?.resumo;
    const agendamentos = relatorio?.agendamentos;
    const animais = relatorio?.animais;

    const cards = useMemo(() => {
        if (!resumo) return [];

        return [
            {
                id: "atendimentos",
                titulo: "Agendamentos no período",
                valor: formatarNumero(agendamentos?.total),
                detalhe: `${percentual(agendamentos?.concluidos, agendamentos?.total)}% concluídos`,
                icone: "fa-regular fa-calendar-check",
                classe: "verde"
            },
            {
                id: "clientes",
                titulo: "Clientes cadastrados",
                valor: formatarNumero(resumo.clientes),
                detalhe: `${formatarNumero(resumo.animais)} animais registrados`,
                icone: "fa-solid fa-user-group",
                classe: "azul"
            },
            {
                id: "veterinarios",
                titulo: "Veterinários ativos",
                valor: formatarNumero(resumo.veterinarios),
                detalhe: `${formatarNumero(resumo.unidadesAtivas)} unidades em operação`,
                icone: "fa-solid fa-stethoscope",
                classe: "laranja"
            },
            {
                id: "vacinacao",
                titulo: "Cobertura vacinal",
                valor: `${animais?.coberturaVacinacao ?? 0}%`,
                detalhe: `${formatarNumero(animais?.vacinados)} de ${formatarNumero(animais?.total)} animais`,
                icone: "fa-solid fa-syringe",
                classe: "vermelho"
            }
        ];
    }, [resumo, agendamentos, animais]);

    const totalPorServico = useMemo(() => {
        return (relatorio?.porServico || []).reduce(
            (soma, item) => soma + item.total,
            0
        );
    }, [relatorio]);

    const totalPorUnidade = useMemo(() => {
        return (relatorio?.porUnidade || []).reduce(
            (soma, item) => soma + item.total,
            0
        );
    }, [relatorio]);

    const totalPorVeterinario = useMemo(() => {
        return (relatorio?.porVeterinario || []).reduce(
            (soma, item) => soma + item.total,
            0
        );
    }, [relatorio]);

    return (
        <div className="content">
            <Aside />

            <main className="relatorios-page">
                <header>
                    <div className="info_user">
                        <i className="fa-solid fa-chart-pie"></i>

                        <div className="titulo">
                            <h1>Relatórios</h1>
                            <p>
                                Indicadores de atendimento, ocupação das unidades
                                e perfil dos animais cadastrados.
                            </p>
                        </div>
                    </div>

                    <div className="filtro-periodo">
                        <label htmlFor="periodo">Período</label>

                        <select
                            id="periodo"
                            value={periodo}
                            onChange={(event) => setPeriodo(Number(event.target.value))}
                        >
                            {PERIODOS.map((opcao) => (
                                <option key={opcao.valor} value={opcao.valor}>
                                    {opcao.rotulo}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => carregarRelatorio(periodo)}
                            title="Atualizar indicadores"
                        >
                            <i className={`fa-solid fa-rotate ${carregando ? "fa-spin" : ""}`}></i>
                        </button>
                    </div>
                </header>

                {mensagem && (
                    <div className="mensagem-erro">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{mensagem}</span>

                        <button
                            type="button"
                            onClick={() => setMensagem("")}
                            aria-label="Fechar mensagem"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}

                {carregando && !relatorio ? (
                    <div className="estado-carregando">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <p>Gerando relatório...</p>
                    </div>
                ) : !relatorio ? (
                    <div className="estado-carregando">
                        <i className="fa-solid fa-chart-simple"></i>
                        <p>Nenhum dado disponível para o período selecionado.</p>
                    </div>
                ) : (
                    <>
                        <section className="cards-resumo">
                            {cards.map((card) => (
                                <div className={`card-resumo ${card.classe}`} key={card.id}>
                                    <div className="icone-card">
                                        <i className={card.icone}></i>
                                    </div>

                                    <div className="texto-card">
                                        <p>{card.titulo}</p>
                                        <h2>{card.valor}</h2>
                                        <small>{card.detalhe}</small>
                                    </div>
                                </div>
                            ))}
                        </section>

                        <section className="painel-duplo">
                            <div className="painel grafico-painel">
                                <div className="painel-topo">
                                    <div>
                                        <h2>Agendamentos por mês</h2>
                                        <p>Volume total e parte concluída em cada mês.</p>
                                    </div>

                                    <div className="legenda">
                                        <span><i className="marcador total"></i>Total</span>
                                        <span><i className="marcador concluido"></i>Concluídos</span>
                                    </div>
                                </div>

                                {relatorio.porMes.length === 0 ? (
                                    <p className="painel-vazio">Sem registros no período.</p>
                                ) : (
                                    <GraficoColunas
                                        dados={relatorio.porMes}
                                        corDestaque="#084D39"
                                    />
                                )}
                            </div>

                            <div className="painel status-painel">
                                <div className="painel-topo">
                                    <div>
                                        <h2>Situação dos agendamentos</h2>
                                        <p>Distribuição por status no período.</p>
                                    </div>
                                </div>

                                <div className="lista-status">
                                    <div className="item-status">
                                        <span className="rotulo">Pendentes</span>
                                        <strong>{formatarNumero(agendamentos?.pendentes)}</strong>
                                        <div className="trilha">
                                            <span
                                                className="preenchimento pendente"
                                                style={{
                                                    width: `${percentual(agendamentos?.pendentes, agendamentos?.total)}%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="item-status">
                                        <span className="rotulo">Concluídos</span>
                                        <strong>{formatarNumero(agendamentos?.concluidos)}</strong>
                                        <div className="trilha">
                                            <span
                                                className="preenchimento concluido"
                                                style={{
                                                    width: `${percentual(agendamentos?.concluidos, agendamentos?.total)}%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="item-status">
                                        <span className="rotulo">Cancelados</span>
                                        <strong>{formatarNumero(agendamentos?.cancelados)}</strong>
                                        <div className="trilha">
                                            <span
                                                className="preenchimento cancelado"
                                                style={{
                                                    width: `${percentual(agendamentos?.cancelados, agendamentos?.total)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="resumo-taxas">
                                    <div>
                                        <small>Taxa de conclusão</small>
                                        <strong>{agendamentos?.taxaConclusao ?? 0}%</strong>
                                    </div>

                                    <div>
                                        <small>Taxa de cancelamento</small>
                                        <strong>{agendamentos?.taxaCancelamento ?? 0}%</strong>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="painel-duplo">
                            <div className="painel">
                                <div className="painel-topo">
                                    <div>
                                        <h2>Atendimentos por unidade</h2>
                                        <p>Comparação entre as unidades no período.</p>
                                    </div>
                                </div>

                                {relatorio.porUnidade.length === 0 ? (
                                    <p className="painel-vazio">Sem unidades registradas.</p>
                                ) : (
                                    <div className="lista-ranking">
                                        {relatorio.porUnidade.map((unidade) => (
                                            <div className="item-ranking" key={unidade.id}>
                                                <div className="linha-ranking">
                                                    <span className="nome" title={unidade.nome}>
                                                        {unidade.nome}
                                                    </span>

                                                    <span className="numero">
                                                        {formatarNumero(unidade.total)}
                                                    </span>
                                                </div>

                                                <div className="trilha">
                                                    <span
                                                        className="preenchimento unidade"
                                                        style={{
                                                            width: `${percentual(
                                                                unidade.total,
                                                                totalPorUnidade
                                                            )}%`
                                                        }}
                                                    />
                                                </div>

                                                <div className="detalhes-ranking">
                                                    <small>
                                                        {formatarNumero(unidade.concluidos)} concluídos
                                                    </small>
                                                    <small>
                                                        {formatarNumero(unidade.cancelados)} cancelados
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="painel">
                                <div className="painel-topo">
                                    <div>
                                        <h2>Serviços mais procurados</h2>
                                        <p>Procedimentos com maior volume de agendamentos.</p>
                                    </div>
                                </div>

                                {relatorio.porServico.length === 0 ? (
                                    <p className="painel-vazio">Sem serviços registrados.</p>
                                ) : (
                                    <div className="lista-ranking">
                                        {relatorio.porServico.map((servico) => (
                                            <div className="item-ranking" key={servico.id}>
                                                <div className="linha-ranking">
                                                    <span className="nome" title={servico.nome}>
                                                        {servico.nome}
                                                    </span>

                                                    <span className="numero">
                                                        {formatarNumero(servico.total)}
                                                    </span>
                                                </div>

                                                <div className="trilha">
                                                    <span
                                                        className="preenchimento servico"
                                                        style={{
                                                            width: `${percentual(
                                                                servico.total,
                                                                totalPorServico
                                                            )}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="painel-duplo">
                            <div className="painel">
                                <div className="painel-topo">
                                    <div>
                                        <h2>Desempenho dos veterinários</h2>
                                        <p>Atendimentos concluídos por profissional.</p>
                                    </div>
                                </div>

                                {relatorio.porVeterinario.length === 0 ? (
                                    <p className="painel-vazio">
                                        Nenhum atendimento registrado no período.
                                    </p>
                                ) : (
                                    <div className="lista-ranking">
                                        {relatorio.porVeterinario.map((veterinario) => (
                                            <div className="item-ranking" key={veterinario.id}>
                                                <div className="linha-ranking">
                                                    <span className="nome" title={veterinario.nome}>
                                                        {veterinario.nome}
                                                        {veterinario.especialidade && (
                                                            <small className="especialidade">
                                                                {veterinario.especialidade}
                                                            </small>
                                                        )}
                                                    </span>

                                                    <span className="numero">
                                                        {formatarNumero(veterinario.total)}
                                                    </span>
                                                </div>

                                                <div className="trilha">
                                                    <span
                                                        className="preenchimento veterinario"
                                                        style={{
                                                            width: `${percentual(
                                                                veterinario.total,
                                                                totalPorVeterinario
                                                            )}%`
                                                        }}
                                                    />
                                                </div>

                                                <div className="detalhes-ranking">
                                                    <small>
                                                        {formatarNumero(veterinario.concluidos)} concluídos
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="painel">
                                <div className="painel-topo">
                                    <div>
                                        <h2>Próximos atendimentos</h2>
                                        <p>Agendamentos confirmados a partir de hoje.</p>
                                    </div>
                                </div>

                                {relatorio.proximos.length === 0 ? (
                                    <p className="painel-vazio">
                                        Nenhum atendimento futuro registrado.
                                    </p>
                                ) : (
                                    <div className="lista-proximos">
                                        {relatorio.proximos.map((item) => (
                                            <div className="item-proximo" key={item.id}>
                                                <div className="data-proximo">
                                                    <span>{formatarData(item.inicio)}</span>
                                                    <small>
                                                        {STATUS_ROTULOS[item.status] || item.status}
                                                    </small>
                                                </div>

                                                <div className="detalhes-proximo">
                                                    <strong>
                                                        {item.animal} · {item.cliente}
                                                    </strong>
                                                    <small>
                                                        {item.servico} — {item.unidade}
                                                    </small>
                                                    <small>
                                                        <i className="fa-solid fa-user-doctor"></i>
                                                        {item.veterinario}
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {relatorio.medicamentos.length > 0 && (
                            <section className="painel">
                                <div className="painel-topo">
                                    <div>
                                        <h2>Medicamentos mais prescritos</h2>
                                        <p>Ranking geral de prescrições registradas.</p>
                                    </div>
                                </div>

                                <div className="lista-medicamentos">
                                    {relatorio.medicamentos.map((medicamento) => (
                                        <div className="item-medicamento" key={medicamento.id}>
                                            <i className="fa-solid fa-pills"></i>
                                            <span>{medicamento.nome}</span>
                                            <strong>{formatarNumero(medicamento.total)}</strong>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

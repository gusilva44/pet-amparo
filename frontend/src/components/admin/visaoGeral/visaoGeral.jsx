import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { relatoriosApi } from "../../../services/api";
import { mensagemErroApi } from "../../../utils/api";
import Aside from "../../aside/aside";
import "./visaoGeral.scss";

import Localizacao from "../../../assets/imagens/icones/localizacaoAdm.svg";
import Veterinario from "../../../assets/imagens/icones/veterinarioAdm.svg";
import Calendario from "../../../assets/imagens/icones/calendarioAdm.svg";
import Agenda from "../../../assets/imagens/icones/agendaAdm.svg";
import Cadastro from "../../../assets/imagens/icones/cadastrar.svg";
import Usuario from "../../../assets/imagens/icones/usuario.svg";
import Servico from "../../../assets/imagens/icones/servicos.svg";
import Grafico from "../../../assets/imagens/icones/grafico.svg";

const ATALHOS = [
    {
        id: 1,
        titulo: "Cadastrar unidade",
        texto: "Nova unidade da clínica",
        icone: Cadastro,
        caminho: "/unidades"
    },
    {
        id: 2,
        titulo: "Gerenciar usuários",
        texto: "Clientes e veterinários",
        icone: Usuario,
        caminho: "/usuarios"
    },
    {
        id: 3,
        titulo: "Cadastrar serviço",
        texto: "Novo procedimento",
        icone: Servico,
        caminho: "/servicos"
    },
    {
        id: 4,
        titulo: "Ver relatórios",
        texto: "Estatísticas e indicadores",
        icone: Grafico,
        caminho: "/relatorios"
    }
];

const PERIODO_PADRAO = 6;

export default function VisaoGeral() {
    const [relatorio, setRelatorio] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState("");

    const carregar = useCallback(async () => {
        try {
            setCarregando(true);
            setMensagem("");

            const resposta = await relatoriosApi.obter(PERIODO_PADRAO);
            setRelatorio(resposta?.resultado || null);
        } catch (error) {
            setMensagem(mensagemErroApi(error));
            setRelatorio(null);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const cards = useMemo(() => {
        const resumo = relatorio?.resumo;
        const agendamentos = relatorio?.agendamentos;

        if (!resumo) return [];

        return [
            {
                id: 1,
                titulo: "Unidades cadastradas",
                numero: resumo.unidades,
                texto: `${resumo.unidadesAtivas} ativas`,
                icone: Localizacao
            },
            {
                id: 2,
                titulo: "Clientes cadastrados",
                numero: resumo.clientes,
                texto: `${resumo.animais} animais registrados`,
                icone: Veterinario
            },
            {
                id: 3,
                titulo: "Serviços cadastrados",
                numero: resumo.servicos,
                texto: `${resumo.servicosAtivos} ativos`,
                icone: Calendario
            },
            {
                id: 4,
                titulo: "Atendimentos pendentes",
                numero: agendamentos?.pendentes ?? 0,
                texto: `${agendamentos?.total ?? 0} agendamentos no período`,
                icone: Agenda
            }
        ];
    }, [relatorio]);

    return (
        <div className="page-visao">
            <Aside />

            <main className="conteudo-visao">
                <header>
                    <div className="texto-admin">
                        <h1>Olá, administrador!</h1>
                        <p>
                            Acompanhe a situação das unidades veterinárias
                            e os indicadores da clínica.
                        </p>
                    </div>

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

                    <section className="cards">
                        {carregando && cards.length === 0
                            ? Array.from({ length: 4 }).map((_, indice) => (
                                <div className="info esqueleto" key={`carregando-${indice}`}>
                                    <div className="i" />
                                    <div className="texto-card">
                                        <h2>Carregando...</h2>
                                    </div>
                                </div>
                            ))
                            : cards.map((card) => (
                                <div className="info" key={card.id}>
                                    <div className="i">
                                        <img src={card.icone} alt="" />
                                    </div>

                                    <div className="texto-card">
                                        <h2>{card.titulo}</h2>
                                        <h1 className="num-tempoReal">{card.numero}</h1>
                                        <p>{card.texto}</p>
                                    </div>
                                </div>
                            ))}
                    </section>

                    <section className="secao-inferior">
                        <div className="coluna-principal">
                            <div className="acesso">
                                <h2>Acesso rápido</h2>

                                <div className="cards-acesso">
                                    {ATALHOS.map((atalho) => (
                                        <Link
                                            className="info-acesso"
                                            to={atalho.caminho}
                                            key={atalho.id}
                                        >
                                            <div className="i-acesso">
                                                <img src={atalho.icone} alt="" />
                                            </div>

                                            <div className="texto-card">
                                                <h2>{atalho.titulo}</h2>
                                                <p>{atalho.texto}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </header>
            </main>
        </div>
    );
}

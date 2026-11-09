import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { relatoriosApi } from "../../../services/api";
import { mensagemErroApi } from "../../../utils/api";
import Aside from "../../aside/aside";
import "./visaoGeral.scss";

import Localizacao from "../../../assets/imagens/icones/localizacaoAdm.svg";
import VeterinarioIcone from "../../../assets/imagens/icones/veterinarioAdm.svg";
import Calendario from "../../../assets/imagens/icones/calendarioAdm.svg";
import Agenda from "../../../assets/imagens/icones/agendaAdm.svg";
import Cadastro from "../../../assets/imagens/icones/cadastrar.svg";
import Usuario from "../../../assets/imagens/icones/usuario.svg";
import Servico from "../../../assets/imagens/icones/servicos.svg";
import Grafico from "../../../assets/imagens/icones/grafico.svg";

const ATALHOS = [
    { titulo: "Cadastrar unidade", texto: "Adicione ou atualize unidades", icone: Cadastro, caminho: "/unidades" },
    { titulo: "Gerenciar usuários", texto: "Clientes e veterinários", icone: Usuario, caminho: "/usuarios" },
    { titulo: "Gerenciar serviços", texto: "Procedimentos e disponibilidade", icone: Servico, caminho: "/servicos" },
    { titulo: "Ver relatórios", texto: "Indicadores e atendimentos", icone: Grafico, caminho: "/relatorios" },
];

export default function VisaoGeral() {
    const [relatorio, setRelatorio] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setMensagem("");
        try {
            const resposta = await relatoriosApi.obter(6);
            setRelatorio(resposta?.resultado || null);
        } catch (error) {
            setMensagem(mensagemErroApi(error));
            setRelatorio(null);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    const cards = useMemo(() => {
        const resumo = relatorio?.resumo;
        const agendamentos = relatorio?.agendamentos;
        if (!resumo) return [];
        return [
            { titulo: "Unidades", numero: resumo.unidades, detalhe: `${resumo.unidadesAtivas} ativas`, icone: Localizacao },
            { titulo: "Clientes", numero: resumo.clientes, detalhe: `${resumo.animais} pets cadastrados`, icone: Usuario },
            { titulo: "Veterinários", numero: resumo.veterinarios, detalhe: "Profissionais cadastrados", icone: VeterinarioIcone },
            { titulo: "Serviços", numero: resumo.servicos, detalhe: `${resumo.servicosAtivos} ativos`, icone: Calendario },
            { titulo: "Atendimentos pendentes", numero: agendamentos?.pendentes ?? 0, detalhe: `${agendamentos?.total ?? 0} no período`, icone: Agenda },
        ];
    }, [relatorio]);

    return (
        <div className="page-visao">
            <Aside />
            <main className="conteudo-visao">
                <header className="cabecalho-visao">
                    <div>
                        <span className="eyebrow-visao">ADMINISTRAÇÃO</span>
                        <h1>Visão geral</h1>
                        <p>Acompanhe os principais indicadores e gerencie a plataforma.</p>
                    </div>
                    <button type="button" className="atualizar-visao" onClick={carregar} disabled={carregando}>
                        <i className={`fa-solid fa-rotate ${carregando ? "fa-spin" : ""}`} />
                        Atualizar
                    </button>
                </header>

                {mensagem && (
                    <div className="mensagem-erro" role="alert">
                        <i className="fa-solid fa-circle-exclamation" />
                        <span>{mensagem}</span>
                        <button type="button" onClick={() => setMensagem("")} aria-label="Fechar mensagem"><i className="fa-solid fa-xmark" /></button>
                    </div>
                )}

                <section className="indicadores-visao" aria-label="Indicadores">
                    {carregando && cards.length === 0
                        ? Array.from({ length: 5 }, (_, index) => <div className="indicador-visao skeleton-visao" key={index}><span /><div><b /><small /></div></div>)
                        : cards.map((card) => (
                            <article className="indicador-visao" key={card.titulo}>
                                <div className="icone-indicador"><img src={card.icone} alt="" /></div>
                                <div className="dados-indicador"><span>{card.titulo}</span><strong>{card.numero}</strong><small>{card.detalhe}</small></div>
                            </article>
                        ))}
                </section>

                <section className="atalhos-visao">
                    <div className="titulo-secao-visao">
                        <div><h2>Acesso rápido</h2><p>Vá direto às áreas de administração.</p></div>
                    </div>
                    <div className="grade-atalhos-visao">
                        {ATALHOS.map((atalho) => (
                            <Link className="atalho-visao" to={atalho.caminho} key={atalho.caminho}>
                                <span className="icone-atalho"><img src={atalho.icone} alt="" /></span>
                                <span className="texto-atalho"><strong>{atalho.titulo}</strong><small>{atalho.texto}</small></span>
                                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

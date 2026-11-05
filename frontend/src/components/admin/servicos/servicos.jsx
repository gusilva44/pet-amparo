import { useCallback, useEffect, useMemo, useState } from "react";
import { servicosApi, unidadesApi } from "../../../services/api";
import { mensagemErroApi } from "../../../utils/api";
import Aside from "../../aside/aside";
import "./servicos.scss";

const DURACOES_SUGERIDAS = [15, 30, 45, 60, 90, 120];

const FORMULARIO_INICIAL = {
    nome: "",
    descricao: "",
    duracao_minutos: 30,
    ativo: true
};

function servicoAtivo(servico) {
    return Number(servico.ativo) === 1 || servico.ativo === true;
}

function formatarDuracao(minutos) {
    const valor = Number(minutos) || 0;

    if (valor < 60) return `${valor} min`;

    const horas = Math.floor(valor / 60);
    const resto = valor % 60;

    return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

function extrairLista(resposta) {
    return resposta?.resultado || resposta?.data?.resultado || [];
}

export default function Servicos() {
    const [servicos, setServicos] = useState([]);
    const [unidades, setUnidades] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState("");

    const [pesquisa, setPesquisa] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const [modal, setModal] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
    const [unidadesSelecionadas, setUnidadesSelecionadas] = useState([]);
    const [salvando, setSalvando] = useState(false);

    const carregarDados = useCallback(async () => {
        try {
            setCarregando(true);
            setMensagem("");

            const [resServicos, resUnidades] = await Promise.allSettled([
                servicosApi.listar(true),
                unidadesApi.listarComServicos()
            ]);

            if (resServicos.status === "rejected") throw resServicos.reason;

            setServicos(extrairLista(resServicos.value));
            setUnidades(
                resUnidades.status === "fulfilled"
                    ? extrairLista(resUnidades.value)
                    : []
            );
        } catch (error) {
            setMensagem(mensagemErroApi(error));
            setServicos([]);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const unidadesPorServico = useMemo(() => {
        const mapa = new Map();

        unidades.forEach((unidade) => {
            (unidade.servicos || []).forEach((servico) => {
                const chave = Number(servico.id_servico);

                if (!mapa.has(chave)) mapa.set(chave, []);

                mapa.get(chave).push(unidade.nome);
            });
        });

        return mapa;
    }, [unidades]);

    const servicosFiltrados = useMemo(() => {
        const termo = pesquisa.trim().toLowerCase();

        return servicos.filter((servico) => {
            const correspondePesquisa =
                !termo ||
                String(servico.nome || "").toLowerCase().includes(termo) ||
                String(servico.descricao || "").toLowerCase().includes(termo);

            const correspondeStatus =
                !filtroStatus ||
                (filtroStatus === "ativo" && servicoAtivo(servico)) ||
                (filtroStatus === "inativo" && !servicoAtivo(servico));

            return correspondePesquisa && correspondeStatus;
        });
    }, [servicos, pesquisa, filtroStatus]);

    const quantidade = useMemo(() => ({
        total: servicos.length,
        ativos: servicos.filter(servicoAtivo).length,
        inativos: servicos.filter((servico) => !servicoAtivo(servico)).length,
        agendamentos: servicos.reduce(
            (total, servico) => total + (Number(servico.total_agendamentos) || 0),
            0
        )
    }), [servicos]);

    function abrirCadastro() {
        setFormulario({ ...FORMULARIO_INICIAL });
        setUnidadesSelecionadas([]);
        setEditando(null);
        setMensagem("");
        setModal(true);
    }

    function abrirEdicao(servico) {
        const vinculadas = (unidadesPorServico.get(Number(servico.id_servico)) || []);
        const ids = unidades
            .filter((unidade) => vinculadas.includes(unidade.nome))
            .map((unidade) => Number(unidade.id_unidade));

        setFormulario({
            nome: servico.nome || "",
            descricao: servico.descricao || "",
            duracao_minutos: Number(servico.duracao_minutos) || 30,
            ativo: servicoAtivo(servico)
        });
        setUnidadesSelecionadas(ids);
        setEditando(servico);
        setMensagem("");
        setModal(true);
    }

    function fecharModal() {
        setModal(false);
        setEditando(null);
        setFormulario(FORMULARIO_INICIAL);
        setUnidadesSelecionadas([]);
    }

    function alterarCampo(event) {
        const { name, value } = event.target;

        setFormulario((anterior) => ({ ...anterior, [name]: value }));
    }

    function definirDuracao(valor) {
        setFormulario((anterior) => ({
            ...anterior,
            duracao_minutos: valor
        }));
    }

    function alternarUnidade(idUnidade) {
        setUnidadesSelecionadas((anteriores) =>
            anteriores.includes(idUnidade)
                ? anteriores.filter((id) => id !== idUnidade)
                : [...anteriores, idUnidade]
        );
    }

    async function salvarServico(event) {
        event.preventDefault();

        if (salvando) return;

        try {
            setSalvando(true);
            setMensagem("");

            const dados = {
                nome: formulario.nome.trim(),
                descricao: formulario.descricao.trim(),
                duracao_minutos: Number(formulario.duracao_minutos),
                ativo: Boolean(formulario.ativo),
                unidades: unidadesSelecionadas
            };

            if (editando) {
                await servicosApi.atualizar(editando.id_servico, dados);
            } else {
                await servicosApi.criar(dados);
            }

            fecharModal();
            await carregarDados();
        } catch (error) {
            setMensagem(mensagemErroApi(error));
        } finally {
            setSalvando(false);
        }
    }

    async function alterarStatus(servico) {
        const ativo = servicoAtivo(servico);

        const confirmar = window.confirm(
            ativo
                ? `Desativar o serviço "${servico.nome}"? Ele deixará de aparecer para novos agendamentos.`
                : `Reativar o serviço "${servico.nome}"?`
        );

        if (!confirmar) return;

        try {
            setMensagem("");
            await servicosApi.alterarStatus(servico.id_servico, !ativo);
            await carregarDados();
        } catch (error) {
            setMensagem(mensagemErroApi(error));
        }
    }

    return (
        <div className="content">
            <Aside />

            <main className="servicos-page">
                <header>
                    <div className="info_user">
                        <i className="fa-solid fa-stethoscope"></i>

                        <div className="titulo">
                            <h1>Serviços</h1>
                            <p>
                                Procedimentos oferecidos pela clínica, duração
                                média e unidades onde estão disponíveis.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="sub">
                    <div className="card-sub">
                        <div className="icone-sub">
                            <i className="fa-solid fa-stethoscope"></i>
                        </div>

                        <div>
                            <p>Total de serviços</p>
                            <h2>{quantidade.total}</h2>
                        </div>
                    </div>

                    <div className="card-sub">
                        <div className="icone-sub">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>

                        <div>
                            <p>Serviços ativos</p>
                            <h2>{quantidade.ativos}</h2>
                        </div>
                    </div>

                    <div className="card-sub">
                        <div className="icone-sub">
                            <i className="fa-solid fa-circle-pause"></i>
                        </div>

                        <div>
                            <p>Serviços inativos</p>
                            <h2>{quantidade.inativos}</h2>
                        </div>
                    </div>

                    <div className="card-sub">
                        <div className="icone-sub">
                            <i className="fa-regular fa-calendar-check"></i>
                        </div>

                        <div>
                            <p>Agendamentos vinculados</p>
                            <h2>{quantidade.agendamentos}</h2>
                        </div>
                    </div>
                </section>

                <section className="pesquisa">
                    <div className="buscar">
                        <i className="fa-solid fa-magnifying-glass"></i>

                        <input
                            type="text"
                            placeholder="Buscar por nome ou descrição do serviço..."
                            value={pesquisa}
                            onChange={(event) => setPesquisa(event.target.value)}
                        />
                    </div>

                    <div className="filtros">
                        <select
                            value={filtroStatus}
                            onChange={(event) => setFiltroStatus(event.target.value)}
                        >
                            <option value="">Todos os status</option>
                            <option value="ativo">Ativos</option>
                            <option value="inativo">Inativos</option>
                        </select>
                    </div>

                    <button type="button" className="criar" onClick={abrirCadastro}>
                        <i className="fa-solid fa-plus"></i>
                        Novo serviço
                    </button>
                </section>

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

                <section className="servicos">
                    <div className="cabeca">
                        <div>Serviço</div>
                        <div>Duração</div>
                        <div>Unidades</div>
                        <div>Agendamentos</div>
                        <div>Status</div>
                        <div>Ações</div>
                    </div>

                    {carregando ? (
                        <div className="vazio">
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            <p>Carregando serviços...</p>
                        </div>
                    ) : servicosFiltrados.length === 0 ? (
                        <div className="vazio">
                            <i className="fa-solid fa-stethoscope"></i>
                            <p>Nenhum serviço encontrado com esses filtros.</p>
                        </div>
                    ) : (
                        servicosFiltrados.map((servico) => {
                            const vinculadas =
                                unidadesPorServico.get(Number(servico.id_servico)) || [];
                            const totalUnidades = Number(servico.total_unidades) || 0;
                            const totalAgendamentos =
                                Number(servico.total_agendamentos) || 0;

                            return (
                                <div className="linha-servico" key={servico.id_servico}>
                                    <div className="identificacao-servico">
                                        <div className="avatar-servico">
                                            <i className="fa-solid fa-stethoscope"></i>
                                        </div>

                                        <div>
                                            <strong>{servico.nome}</strong>
                                            <small>
                                                {servico.descricao || "Sem descrição cadastrada"}
                                            </small>
                                        </div>
                                    </div>

                                    <div className="duracao-servico">
                                        <span>
                                            <i className="fa-regular fa-clock"></i>
                                            {formatarDuracao(servico.duracao_minutos)}
                                        </span>
                                        <small>
                                            {servico.duracao_minutos} minutos
                                        </small>
                                    </div>

                                    <div className="unidades-servico">
                                        <span>{totalUnidades}</span>
                                        <small
                                            title={vinculadas.join(", ")}
                                        >
                                            {totalUnidades === 1 ? "unidade" : "unidades"}
                                        </small>
                                    </div>

                                    <div className="agendamentos-servico">
                                        <span>{totalAgendamentos}</span>
                                        <small>
                                            {totalAgendamentos === 1
                                                ? "agendamento"
                                                : "agendamentos"}
                                        </small>
                                    </div>

                                    <div>
                                        <span
                                            className={`status-servico ${
                                                servicoAtivo(servico) ? "ativo" : "inativo"
                                            }`}
                                        >
                                            {servicoAtivo(servico) ? "Ativo" : "Inativo"}
                                        </span>
                                    </div>

                                    <div className="acoes-servico">
                                        <button
                                            type="button"
                                            title="Editar serviço"
                                            onClick={() => abrirEdicao(servico)}
                                        >
                                            <i className="fa-solid fa-pen"></i>
                                        </button>

                                        <button
                                            type="button"
                                            title={
                                                servicoAtivo(servico)
                                                    ? "Desativar serviço"
                                                    : "Reativar serviço"
                                            }
                                            onClick={() => alterarStatus(servico)}
                                        >
                                            <i
                                                className={`fa-solid ${
                                                    servicoAtivo(servico)
                                                        ? "fa-toggle-on"
                                                        : "fa-toggle-off"
                                                }`}
                                            ></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </section>

                <p className="total-servicos">
                    Exibindo {servicosFiltrados.length} de {servicos.length} serviços
                </p>

                {modal && (
                    <div
                        className="modal-overlay"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) fecharModal();
                        }}
                    >
                        <section className="modal-servico">
                            <div className="cabecalho-modal">
                                <div>
                                    <h2>{editando ? "Editar serviço" : "Novo serviço"}</h2>
                                    <p>
                                        Defina o procedimento, a duração e em quais
                                        unidades ele pode ser agendado.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    aria-label="Fechar modal"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <form onSubmit={salvarServico}>
                                <div className="campo">
                                    <label htmlFor="nome">Nome do serviço *</label>
                                    <input
                                        id="nome"
                                        name="nome"
                                        value={formulario.nome}
                                        onChange={alterarCampo}
                                        placeholder="Ex.: Consulta de rotina"
                                        maxLength={120}
                                        required
                                    />
                                </div>

                                <div className="campo">
                                    <label htmlFor="descricao">Descrição</label>
                                    <input
                                        id="descricao"
                                        name="descricao"
                                        value={formulario.descricao}
                                        onChange={alterarCampo}
                                        placeholder="O que está incluído neste atendimento"
                                        maxLength={255}
                                    />
                                </div>

                                <div className="campo">
                                    <label htmlFor="duracao_minutos">
                                        Duração em minutos *
                                    </label>
                                    <input
                                        id="duracao_minutos"
                                        name="duracao_minutos"
                                        type="number"
                                        min="5"
                                        max="480"
                                        value={formulario.duracao_minutos}
                                        onChange={alterarCampo}
                                        required
                                    />

                                    <div className="sugestoes-duracao">
                                        {DURACOES_SUGERIDAS.map((minutos) => (
                                            <button
                                                type="button"
                                                key={minutos}
                                                className={`sugestao ${
                                                    Number(formulario.duracao_minutos) === minutos
                                                        ? "ativa"
                                                        : ""
                                                }`}
                                                onClick={() => definirDuracao(minutos)}
                                            >
                                                {formatarDuracao(minutos)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={formulario.ativo}
                                        onChange={(event) =>
                                            setFormulario((anterior) => ({
                                                ...anterior,
                                                ativo: event.target.checked
                                            }))
                                        }
                                    />
                                    Serviço disponível para agendamento
                                </label>

                                <div className="campo campo-unidades">
                                    <label>Unidades que oferecem o serviço</label>

                                    {unidades.length === 0 ? (
                                        <p className="aviso-unidades">
                                            Nenhuma unidade cadastrada. Cadastre uma
                                            unidade antes de vincular este serviço.
                                        </p>
                                    ) : (
                                        <div className="lista-unidades">
                                            {unidades.map((unidade) => (
                                                <label
                                                    className="opcao-unidade"
                                                    key={unidade.id_unidade}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={unidadesSelecionadas.includes(
                                                            Number(unidade.id_unidade)
                                                        )}
                                                        onChange={() =>
                                                            alternarUnidade(
                                                                Number(unidade.id_unidade)
                                                            )
                                                        }
                                                    />
                                                    <span>{unidade.nome}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="botoes-modal">
                                    <button
                                        type="button"
                                        className="cancelar"
                                        onClick={fecharModal}
                                        disabled={salvando}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="salvar"
                                        disabled={salvando}
                                    >
                                        {salvando ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-check"></i>
                                                {editando ? "Salvar alterações" : "Cadastrar serviço"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}

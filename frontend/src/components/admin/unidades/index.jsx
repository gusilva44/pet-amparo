import { useEffect, useMemo, useState } from "react";
import { unidadesApi } from '../../../services/api.js'
import uni from '../../../data/unidades.js'
import Aside from '../../aside/aside.jsx'
import "./index.scss";

const formularioInicial = {
    nome: "",
    descricao: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "SP",
    telefone: "",
    email: "",
    latitude: "",
    longitude: ""
};

function extrairResultado(resposta) {
    return resposta?.resultado || resposta?.data?.resultado || [];
}

function unidadeAtiva(unidade) {
    return Number(unidade.ativo) === 1 || unidade.ativo === true;
}

export default function UnidadesAdmin() {
    const [unidades, setUnidades] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState("");

    const [pesquisa, setPesquisa] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const [modal, setModal] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [salvando, setSalvando] = useState(false);

    async function carregarUnidades() {
        try {
            setCarregando(true);

            const resposta = await unidadesApi.listarComServicos();

            setUnidades(extrairResultado(resposta));
            setMensagem("");
        } catch (error) {
            setMensagem(error.message)
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarUnidades();
    }, []);

    const unidadesFiltradas = useMemo(() => {
        return unidades.filter((unidade) => {
            const termo = pesquisa.toLowerCase();

            const correspondePesquisa = [
                unidade.nome,
                unidade.endereco,
                unidade.bairro,
                unidade.cidade,
                unidade.estado
            ].some((valor) =>
                String(valor || "").toLowerCase().includes(termo)
            );

            const correspondeStatus =
                !filtroStatus ||
                (filtroStatus === "ativo" && unidadeAtiva(unidade)) ||
                (filtroStatus === "inativo" && !unidadeAtiva(unidade));

            return correspondePesquisa && correspondeStatus;
        });
    }, [unidades, pesquisa, filtroStatus]);

    const quantidade = useMemo(() => ({
        total: unidades.length,
        ativas: unidades.filter(unidadeAtiva).length,
        inativas: unidades.filter((u) => !unidadeAtiva(u)).length,
        servicos: unidades.reduce(
            (total, unidade) => total + (unidade.servicos?.length || 0),
            0
        )
    }), [unidades]);

    function abrirCadastro() {
        setFormulario({ ...formularioInicial });
        setEditando(null);
        setMensagem("");
        setModal(true);
    }

    function abrirEdicao(unidade) {
        setFormulario({
            nome: unidade.nome || "",
            descricao: unidade.descricao || "",
            cep: unidade.cep || "",
            endereco: unidade.endereco || "",
            numero: unidade.numero || "",
            complemento: unidade.complemento || "",
            bairro: unidade.bairro || "",
            cidade: unidade.cidade || "",
            estado: unidade.estado || "SP",
            telefone: unidade.telefone || "",
            email: unidade.email || "",
            latitude: unidade.latitude ?? "",
            longitude: unidade.longitude ?? ""
        });

        setEditando(unidade);
        setMensagem("");
        setModal(true);
    }

    function fecharModal() {
        setModal(false);
        setEditando(null);
        setFormulario({ ...formularioInicial });
    }

    function alterarCampo(event) {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: name === "estado" ? value.toUpperCase() : value
        }));
    }

    async function salvarUnidade(event) {
        event.preventDefault();

        setSalvando(true);
        setMensagem("");

        try {
            const dados = {
                ...formulario,
                latitude: formulario.latitude === ""
                    ? null
                    : Number(formulario.latitude),
                longitude: formulario.longitude === ""
                    ? null
                    : Number(formulario.longitude),
                ativo: editando ? unidadeAtiva(editando) : true
            };

            if (editando) {
                const id = editando.id_unidade;

                if (!id) {
                    throw new Error("ID da unidade não encontrado.");
                }

                await unidadesApi.atualizar(id, dados);
            } else {
                await unidadesApi.criar(dados);
            }

            fecharModal();
            await carregarUnidades();
        } catch (error) {
            setMensagem(
                error.message ||
                "Não foi possível salvar a unidade."
            );
        } finally {
            setSalvando(false);
        }
    }

    async function alterarStatus(unidade) {
        const ativo = unidadeAtiva(unidade);

        const confirmar = window.confirm(
            ativo
                ? `Deseja desativar a unidade "${unidade.nome}"? Ela deixará de ficar disponível para novos agendamentos.`
                : `Deseja reativar a unidade "${unidade.nome}"?`
        );

        if (!confirmar) return;

        try {
            setMensagem("");

            await unidadesApi.alterarStatus(
                unidade.id_unidade,
                !ativo
            );

            await carregarUnidades();
        } catch (error) {
            setMensagem(error.message);
        }
    }

    async function excluirUnidade(unidade) {
        const confirmar = window.confirm(
            `Deseja excluir permanentemente a unidade "${unidade.nome}"? Essa ação não poderá ser desfeita. Unidades com veterinários vinculados ou agendamentos não poderão ser excluídas.`
        );

        if (!confirmar) return;

        try {
            setMensagem("");

            await unidadesApi.excluir(unidade.id_unidade);

            await carregarUnidades();
        } catch (error) {
            setMensagem(error.message);
        }
    }

    return (
        <div className="content">
            <Aside />

            <main className="unidades-page">
                <header>
                    <div className="info_user">
                        <i className="fa-solid fa-hospital"></i>

                        <div className="titulo">
                            <h1>Unidades</h1>
                            <p>
                                Gerencie as unidades da clínica, seus endereços
                                e serviços disponíveis.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="sub">
                    <div className="card-sub">
                        <div className="icone-sub">
                            <i className="fa-solid fa-hospital"></i>
                        </div>

                        <div>
                            <p>Total de unidades</p>
                            <h2>{quantidade.total}</h2>
                        </div>
                    </div>

                    <div className="card-sub">
                        <div className="icone-sub">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>

                        <div>
                            <p>Unidades ativas</p>
                            <h2>{quantidade.ativas}</h2>
                        </div>
                    </div>

                    <div className="card-sub">
                        <div className="icone-sub inativo">
                            <i className="fa-solid fa-circle-pause"></i>
                        </div>

                        <div>
                            <p>Unidades inativas</p>
                            <h2>{quantidade.inativas}</h2>
                        </div>
                    </div>

                    <div className="card-sub">
                        <div className="icone-sub servicos">
                            <i className="fa-solid fa-stethoscope"></i>
                        </div>

                        <div>
                            <p>Serviços vinculados</p>
                            <h2>{quantidade.servicos}</h2>
                        </div>
                    </div>
                </section>

                <section className="pesquisa">
                    <div className="buscar">
                        <i className="fa-solid fa-magnifying-glass"></i>

                        <input
                            type="text"
                            placeholder="Buscar unidade, endereço ou cidade..."
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
                            <option value="ativo">Ativas</option>
                            <option value="inativo">Inativas</option>
                        </select>
                    </div>

                    <button className="criar" onClick={abrirCadastro}>
                        <i className="fa-solid fa-plus"></i>
                        Nova unidade
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

                <section className="unidades">
                    <div className="cabeca">
                        <div>Unidade</div>
                        <div>Endereço</div>
                        <div>Contato</div>
                        <div>Serviços</div>
                        <div>Status</div>
                        <div>Ações</div>
                    </div>

                    {carregando ? (
                        <div className="vazio">
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            <p>Carregando unidades...</p>
                        </div>
                    ) : unidadesFiltradas.length === 0 ? (
                        <div className="vazio">
                            <i className="fa-solid fa-hospital"></i>
                            <p>Nenhuma unidade encontrada.</p>
                        </div>
                    ) : (
                        unidadesFiltradas.map((unidade) => (
                            <div
                                className="linha-unidade"
                                key={unidade.id_unidade}
                            >
                                <div className="identificacao">
                                    <div className="avatar-unidade">
                                        <img src={uni.find(u => u.id === unidade.id_unidade)?.img} alt="" />
                                    </div>

                                    <div>
                                        <strong>{unidade.nome}</strong>
                                        <small>
                                            ID: {unidade.id_unidade}
                                        </small>
                                    </div>
                                </div>

                                <div className="endereco-unidade">
                                    <strong>{unidade.endereco}, {unidade.numero || "S/N"}</strong>
                                    <small>
                                        {unidade.bairro} - {unidade.cidade}/{unidade.estado}
                                    </small>
                                </div>

                                <div className="contato-unidade">
                                    <span>
                                        <i className="fa-solid fa-phone"></i>
                                        {unidade.telefone || "Não informado"}
                                    </span>
                                    <small>{unidade.email || "Sem e-mail"}</small>
                                </div>

                                <div className="servicos-unidade">
                                    <span>
                                        {unidade.servicos?.length || 0}
                                    </span>
                                    <small>
                                        {(unidade.servicos?.length || 0) === 1
                                            ? "serviço"
                                            : "serviços"}
                                    </small>
                                </div>

                                <div>
                                    <span
                                        className={`status-unidade ${
                                            unidadeAtiva(unidade)
                                                ? "ativo"
                                                : "inativo"
                                        }`}
                                    >
                                        {unidadeAtiva(unidade)
                                            ? "Ativa"
                                            : "Inativa"}
                                    </span>
                                </div>

                                <div className="acoes-unidade">
                                    <button
                                        type="button"
                                        title="Editar unidade"
                                        onClick={() => abrirEdicao(unidade)}
                                    >
                                        <i className="fa-solid fa-pen"></i>
                                    </button>

                                    <button
                                        type="button"
                                        title={unidadeAtiva(unidade)
                                            ? "Desativar unidade"
                                            : "Reativar unidade"}
                                        onClick={() => alterarStatus(unidade)}
                                    >
                                        <i className={`fa-solid ${
                                            unidadeAtiva(unidade)
                                                ? "fa-toggle-on"
                                                : "fa-toggle-off"
                                        }`}></i>
                                    </button>

                                    <button
                                        type="button"
                                        className="excluir"
                                        title="Excluir permanentemente"
                                        onClick={() => excluirUnidade(unidade)}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </section>

                <p className="total-unidades">
                    Exibindo {unidadesFiltradas.length} de {unidades.length} unidades
                </p>

                {modal && (
                    <div
                        className="modal-overlay"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                fecharModal();
                            }
                        }}
                    >
                        <section className="modal-unidade">
                            <div className="cabecalho-modal">
                                <div>
                                    <h2>
                                        {editando
                                            ? "Editar unidade"
                                            : "Cadastrar unidade"}
                                    </h2>

                                    <p>
                                        Preencha os dados da unidade da clínica.
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

                            <form onSubmit={salvarUnidade}>
                                <div className="secao-formulario">
                                    <h3>
                                        <i className="fa-solid fa-hospital"></i>
                                        Informações gerais
                                    </h3>

                                    <div className="campo">
                                        <label htmlFor="nome">Nome da unidade *</label>
                                        <input
                                            id="nome"
                                            name="nome"
                                            value={formulario.nome}
                                            onChange={alterarCampo}
                                            placeholder="Ex.: PetAmparo - Centro"
                                            maxLength={150}
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
                                            placeholder="Descrição da unidade"
                                            maxLength={255}
                                        />
                                    </div>
                                </div>

                                <div className="secao-formulario">
                                    <h3>
                                        <i className="fa-solid fa-location-dot"></i>
                                        Endereço
                                    </h3>

                                    <div className="grade-campos">
                                        <div className="campo">
                                            <label htmlFor="cep">CEP</label>
                                            <input
                                                id="cep"
                                                name="cep"
                                                value={formulario.cep}
                                                onChange={alterarCampo}
                                                placeholder="00000-000"
                                                maxLength={9}
                                            />
                                        </div>

                                        <div className="campo campo-maior">
                                            <label htmlFor="endereco">Logradouro *</label>
                                            <input
                                                id="endereco"
                                                name="endereco"
                                                value={formulario.endereco}
                                                onChange={alterarCampo}
                                                placeholder="Rua, avenida..."
                                                maxLength={150}
                                                required
                                            />
                                        </div>

                                        <div className="campo">
                                            <label htmlFor="numero">Número</label>
                                            <input
                                                id="numero"
                                                name="numero"
                                                value={formulario.numero}
                                                onChange={alterarCampo}
                                                placeholder="Número"
                                                maxLength={10}
                                            />
                                        </div>

                                        <div className="campo">
                                            <label htmlFor="complemento">Complemento</label>
                                            <input
                                                id="complemento"
                                                name="complemento"
                                                value={formulario.complemento}
                                                onChange={alterarCampo}
                                                placeholder="Sala, bloco..."
                                            />
                                        </div>

                                        <div className="campo">
                                            <label htmlFor="bairro">Bairro *</label>
                                            <input
                                                id="bairro"
                                                name="bairro"
                                                value={formulario.bairro}
                                                onChange={alterarCampo}
                                                required
                                            />
                                        </div>

                                        <div className="campo">
                                            <label htmlFor="cidade">Cidade *</label>
                                            <input
                                                id="cidade"
                                                name="cidade"
                                                value={formulario.cidade}
                                                onChange={alterarCampo}
                                                required
                                            />
                                        </div>

                                        <div className="campo">
                                            <label htmlFor="estado">UF *</label>
                                            <input
                                                id="estado"
                                                name="estado"
                                                value={formulario.estado}
                                                onChange={alterarCampo}
                                                maxLength={2}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="secao-formulario">
                                    <h3>
                                        <i className="fa-solid fa-address-book"></i>
                                        Contato
                                    </h3>

                                    <div className="grade-campos">
                                        <div className="campo">
                                            <label htmlFor="telefone">Telefone</label>
                                            <input
                                                id="telefone"
                                                name="telefone"
                                                type="tel"
                                                value={formulario.telefone}
                                                onChange={alterarCampo}
                                                placeholder="(11) 99999-9999"
                                                maxLength={30}
                                            />
                                        </div>

                                        <div className="campo">
                                            <label htmlFor="email">E-mail</label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formulario.email}
                                                onChange={alterarCampo}
                                                placeholder="unidade@petamparo.com"
                                                maxLength={150}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="secao-formulario">
                                    <h3>
                                        <i className="fa-solid fa-map-pin"></i>
                                        Localização geográfica
                                    </h3>

                                    <div className="grade-campos">
                                        <div className="campo">
                                            <label htmlFor="latitude">Latitude</label>
                                            <input
                                                id="latitude"
                                                name="latitude"
                                                type="number"
                                                step="any"
                                                min="-90"
                                                max="90"
                                                value={formulario.latitude}
                                                onChange={alterarCampo}
                                                placeholder="-23.550520"
                                            />
                                        </div>

                                        <div className="campo">
                                            <label htmlFor="longitude">Longitude</label>
                                            <input
                                                id="longitude"
                                                name="longitude"
                                                type="number"
                                                step="any"
                                                min="-180"
                                                max="180"
                                                value={formulario.longitude}
                                                onChange={alterarCampo}
                                                placeholder="-46.633308"
                                            />
                                        </div>
                                    </div>
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
                                                {editando
                                                    ? "Salvar alterações"
                                                    : "Cadastrar unidade"}
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
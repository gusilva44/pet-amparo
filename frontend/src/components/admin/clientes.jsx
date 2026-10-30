import { useEffect, useMemo, useState } from "react";
import {
    clientesApi,
    veterinariosApi,
    unidadesApi,
    usuariosApi
} from "../../services/api";

import Aside from "../aside/aside";
import { mensagemErroApi } from "../../utils/api";
import "./clientes.scss";

const formularioInicial = {
    nome: "",
    email: "",
    senha: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    endereco: "",
    tipo: "cliente",
    crmv: "",
    especialidade: "",
    id_unidade: ""
};

export default function Clientes() {
    const [usuarios, setUsuarios] = useState([]);
    const [unidades, setUnidades] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState("");

    const [pesquisa, setPesquisa] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const [modal, setModal] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [salvando, setSalvando] = useState(false);

    async function carregarUsuarios() {
        try {
            setCarregando(true);

            const resposta = await usuariosApi.listar();

            setUsuarios(
                resposta?.resultado ||
                resposta?.data?.resultado ||
                []
            );

            setMensagem("");
        } catch (error) {
            setMensagem(mensagemErroApi(error));
        } finally {
            setCarregando(false);
        }
    }

    async function carregarUnidades() {
        try {
            const resposta = await unidadesApi.listar();
            setUnidades(resposta?.resultado || resposta?.data?.resultado || []);
        } catch (error) {
            console.error("Erro ao carregar unidades:", error);
        }
    }

    useEffect(() => {
        carregarUsuarios();
        carregarUnidades();
    }, []);

    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter((usuario) => {
            const nome = (usuario.nome || "").toLowerCase();
            const email = (usuario.email || "").toLowerCase();
            const cpf = usuario.cpf || "";

            const correspondePesquisa =
                nome.includes(pesquisa.toLowerCase()) ||
                email.includes(pesquisa.toLowerCase()) ||
                cpf.includes(pesquisa);

            const correspondeTipo =
                !filtroTipo || usuario.tipo === filtroTipo;

            const correspondeStatus =
                !filtroStatus ||
                (filtroStatus === "ativo" && Number(usuario.ativo) === 1) ||
                (filtroStatus === "inativo" && Number(usuario.ativo) === 0);

            return correspondePesquisa && correspondeTipo && correspondeStatus;
        });
    }, [usuarios, pesquisa, filtroTipo, filtroStatus]);

    const quantidade = {
        clientes: usuarios.filter(u => u.tipo === "cliente").length,
        veterinarios: usuarios.filter(u => u.tipo === "veterinario").length,
        administradores: usuarios.filter(u => u.tipo === "admin").length,
        inativos: usuarios.filter(u => Number(u.ativo) === 0).length
    };

    function abrirCadastro() {
        setFormulario(formularioInicial);
        setEditando(null);
        setMensagem("");
        setModal(true);
    }

    function abrirEdicao(usuario) {
        setFormulario({
            nome: usuario.nome || "",
            email: usuario.email || "",
            senha: "",
            cpf: usuario.cpf || "",
            telefone: usuario.telefone || "",
            data_nascimento: usuario.data_nascimento
                ? String(usuario.data_nascimento).slice(0, 10)
                : "",
            endereco: usuario.endereco || "",
            tipo: usuario.tipo || "cliente",
            crmv: usuario.crmv || "",
            especialidade: usuario.especialidade || "",
            id_unidade: usuario.id_unidade || ""
        });

        setEditando(usuario);
        setMensagem("");
        setModal(true);
    }

    function fecharModal() {
        setModal(false);
        setEditando(null);
        setFormulario(formularioInicial);
    }

    function alterarCampo(event) {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value
        }));
    }

    async function salvarUsuario(event) {
        event.preventDefault();
        setSalvando(true);
        setMensagem("");

        try {
            const dados = { ...formulario };

            if (dados.tipo === "cliente") {
                delete dados.crmv;
                delete dados.especialidade;
                delete dados.id_unidade;
            }

            if (dados.tipo === "admin") {
                delete dados.crmv;
                delete dados.especialidade;
                delete dados.id_unidade;
            }

            if (editando) {
              const id = editando.id_usuario;

              if (!id) throw new Error("ID do usuário não encontrado.");

              delete dados.senha;

              if (dados.tipo === "cliente") {
                  await clientesApi.atualizar(editando.id_cliente, dados);
              } else {
                  await usuariosApi.atualizar(id, {
                      email: dados.email,
                      tipo: dados.tipo
                  });
              }

            } else {
                if (dados.tipo === "cliente") {
                    await clientesApi.criar(dados);
                } else if (dados.tipo === "veterinario") {
                    await veterinariosApi.criar(dados);
                } else {
                    await usuariosApi.criar(dados);
                }
            }

            fecharModal();
            await carregarUsuarios();

        } catch (error) {
            setMensagem(
                mensagemErroApi(error) || error.message || "Não foi possível salvar."
            );
        } finally {
            setSalvando(false);
        }
    }

    async function excluirUsuario(usuario) {
        const confirmar = window.confirm(
            `Deseja realmente excluir ${usuario.nome}? Esta ação pode afetar os registros relacionados.`
        );

        if (!confirmar) return;

        try {
            const id = usuario.id_cliente || usuario.id_usuario;

            if (!id) throw new Error("ID do usuário não encontrado.");

            await clientesApi.excluir(id);
            await carregarUsuarios();

        } catch (error) {
            setMensagem(mensagemErroApi(error));
        }
    }

    async function alterarStatus(usuario) {
        try {
            const id = usuario.id_usuario;

            if (!id) {
                throw new Error("ID do usuário não encontrado.");
            }

            if (Number(usuario.ativo) === 1) {
                await usuariosApi.desativar(id);
            } else {
                await usuariosApi.ativar(id);
            }

            await carregarUsuarios();

            setMensagem("");

        } catch (error) {
            setMensagem(mensagemErroApi(error));
        }
    }

    return (
        <div className="content">
            <Aside />

            <main className="clientes-page">

                <header>
                    <div className="info_user">
                        <i className="fa-solid fa-user-group"></i>

                        <div className="titulo">
                            <h1>Usuários</h1>
                            <p>
                                Gerencie as contas cadastradas no sistema e seus respectivos perfis.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="sub">

                    <div className="card">
                        <div className="ico">
                            <i className="fa-solid fa-user"></i>
                        </div>
                        <div className="text">
                            <p>Clientes</p>
                            <h2>{quantidade.clientes}</h2>
                        </div>
                    </div>

                    <div className="card">
                        <div className="ico">
                            <i className="fa-solid fa-stethoscope"></i>
                        </div>
                        <div className="text">
                            <p>Veterinários</p>
                            <h2>{quantidade.veterinarios}</h2>
                        </div>
                    </div>

                    <div className="card">
                        <div className="ico">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <div className="text">
                            <p>Administradores</p>
                            <h2>{quantidade.administradores}</h2>
                        </div>
                    </div>

                    <div className="card">
                        <div className="ico">
                            <i className="fa-solid fa-ban"></i>
                        </div>
                        <div className="text">
                            <p>Inativados</p>
                            <h2>{quantidade.inativos}</h2>
                        </div>
                    </div>

                </section>

                <section className="pesquisa">

                    <div className="buscar">

                        <div className="pesquisar">
                            <i className="fa-solid fa-magnifying-glass"></i>

                            <input
                                type="text"
                                placeholder="Busque por nome, email ou CPF"
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                            />
                        </div>

                        <label>
                            <p>Tipo de usuário</p>

                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="cliente">Cliente</option>
                                <option value="veterinario">Veterinário</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </label>

                        <label>
                            <p>Status</p>

                            <select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </label>

                    </div>

                    <div className="criar">
                        <button onClick={abrirCadastro}>
                            <i className="fa-solid fa-plus"></i>
                            Cadastrar usuário
                        </button>
                    </div>

                </section>

                {mensagem && (
                    <div className="mensagem-erro">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {mensagem}
                    </div>
                )}

                <section className="usuarios">

                    <div className="cabeca">
                        <span>Usuário</span>
                        <span>Email</span>
                        <span>CPF</span>
                        <span>Tipo</span>
                        <span>Status</span>
                        <span>Ações</span>
                    </div>

                    {carregando ? (
                        <div className="vazio">
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Carregando usuários...
                        </div>
                    ) : usuariosFiltrados.length === 0 ? (
                        <div className="vazio">
                            Nenhum usuário encontrado.
                        </div>
                    ) : (
                        usuariosFiltrados.map((usuario) => (
                            <div className="linha-usuario" key={usuario.id_usuario || usuario.id_cliente}>

                                <div className="usuario-nome">
                                    <div className="avatar">
                                        <i className="fa-solid fa-user"></i>
                                    </div>

                                    <div>
                                        <strong>{usuario.nome}</strong>
                                        <small>
                                            ID: {usuario.id_usuario || usuario.id_cliente}
                                        </small>
                                    </div>
                                </div>

                                <span>{usuario.email}</span>

                                <span>{usuario.cpf || "Não informado"}</span>

                                <span className={`tipo ${usuario.tipo}`}>
                                    {usuario.tipo === "admin"
                                        ? "Administrador"
                                        : usuario.tipo === "veterinario"
                                            ? "Veterinário"
                                            : "Cliente"}
                                </span>

                                <span className={`status ${Number(usuario.ativo) === 1 ? "ativo" : "inativo"}`}>
                                    {Number(usuario.ativo) === 1 ? "Ativo" : "Inativo"}
                                </span>

                                <div className="acoes">
                                    <button
                                        title="Editar usuário"
                                        onClick={() => abrirEdicao(usuario)}
                                    >
                                        <i className="fa-solid fa-pen"></i>
                                    </button>

                                    <button
                                        title="Alterar status"
                                        onClick={() => alterarStatus(usuario)}
                                    >
                                        <i className="fa-solid fa-power-off"></i>
                                    </button>

                                    <button
                                        title="Excluir usuário"
                                        onClick={() => excluirUsuario(usuario)}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>

                            </div>
                        ))
                    )}

                </section>

            </main>

            {modal && (
                <div className="modal-overlay" onClick={fecharModal}>

                    <div
                        className="modal-usuario"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="modal-header">
                            <div>
                                <h2>{editando ? "Editar usuário" : "Cadastrar usuário"}</h2>
                                <p>
                                    {editando
                                        ? "Atualize os dados da conta."
                                        : "Preencha as informações para criar uma nova conta."}
                                </p>
                            </div>

                            <button onClick={fecharModal}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={salvarUsuario}>

                            <div className="campo">
                                <label>Nome completo</label>
                                <input
                                    name="nome"
                                    value={formulario.nome}
                                    onChange={alterarCampo}
                                    required
                                    placeholder="Nome do usuário"
                                />
                            </div>

                            <div className="campo">
                                <label>Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formulario.email}
                                    onChange={alterarCampo}
                                    required
                                    placeholder="email@exemplo.com"
                                />
                            </div>

                            {!editando && (
                                <div className="campo">
                                    <label>Senha</label>
                                    <input
                                        name="senha"
                                        type="password"
                                        value={formulario.senha}
                                        onChange={alterarCampo}
                                        required
                                        minLength={6}
                                        placeholder="Mínimo de 6 caracteres"
                                    />
                                </div>
                            )}

                            <div className="campo">
                                <label>Tipo de usuário</label>

                                <select
                                    name="tipo"
                                    value={formulario.tipo}
                                    onChange={alterarCampo}
                                >
                                    <option value="cliente">Cliente</option>
                                    <option value="veterinario">Veterinário</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            {formulario.tipo === "cliente" && (
                                <>
                                    <div className="campo">
                                        <label>CPF</label>
                                        <input
                                            name="cpf"
                                            value={formulario.cpf}
                                            onChange={alterarCampo}
                                            required
                                            placeholder="000.000.000-00"
                                        />
                                    </div>

                                    <div className="campo">
                                        <label>Data de nascimento</label>
                                        <input
                                            name="data_nascimento"
                                            type="date"
                                            value={formulario.data_nascimento}
                                            onChange={alterarCampo}
                                            required
                                        />
                                    </div>

                                    <div className="campo">
                                        <label>Telefone</label>
                                        <input
                                            name="telefone"
                                            value={formulario.telefone}
                                            onChange={alterarCampo}
                                            required
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>

                                    <div className="campo">
                                        <label>Endereço</label>
                                        <input
                                            name="endereco"
                                            value={formulario.endereco}
                                            onChange={alterarCampo}
                                            required
                                            placeholder="Endereço completo"
                                        />
                                    </div>
                                </>
                            )}

                            {formulario.tipo === "veterinario" && (
                                <>
                                    <div className="campo">
                                        <label>CRMV</label>
                                        <input
                                            name="crmv"
                                            value={formulario.crmv}
                                            onChange={alterarCampo}
                                            required
                                            placeholder="Número do CRMV"
                                        />
                                    </div>

                                    <div className="campo">
                                        <label>Especialidade</label>
                                        <input
                                            name="especialidade"
                                            value={formulario.especialidade}
                                            onChange={alterarCampo}
                                            placeholder="Especialidade"
                                        />
                                    </div>

                                    <div className="campo">
                                        <label>Telefone</label>
                                        <input
                                            name="telefone"
                                            value={formulario.telefone}
                                            onChange={alterarCampo}
                                            placeholder="Telefone"
                                        />
                                    </div>

                                    <div className="campo">
                                        <label>Unidade</label>
                                        <select
                                            name="id_unidade"
                                            value={formulario.id_unidade}
                                            onChange={alterarCampo}
                                            required
                                        >
                                            <option value="">Selecione uma unidade</option>
                                            {unidades.map((unidade) => (
                                                <option
                                                    key={unidade.id_unidade}
                                                    value={unidade.id_unidade}
                                                >
                                                    {unidade.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {formulario.tipo === "admin" && (
                                <div className="aviso-admin">
                                    <i className="fa-solid fa-shield-halved"></i>
                                    Esta conta terá permissões administrativas no sistema.
                                </div>
                            )}

                            <div className="botoes-modal">
                                <button
                                    type="button"
                                    className="cancelar"
                                    onClick={fecharModal}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="salvar"
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? "Salvando..."
                                        : editando
                                            ? "Salvar alterações"
                                            : "Cadastrar usuário"}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Aside from "../components/aside/aside";
import Logo from "../assets/imagens/Logo.webp";
import CadastroPet from "../components/cadastroPet/cadastroPet";
import { authApi, clientesApi, animaisApi } from "../services/api";
import "../scss/meuspets.scss";
import Auth from "../auth/auth";
import { avisarMudancaAutenticacao } from "../utils/authEvents";
import { lerImagem } from "../utils/imagem";

export default function MeusPets() {
  const [searchParams] = useSearchParams();
  const modoAuth = searchParams.get("modo") === "cadastro" ? "cadastro" : "login";
  const [usuario, setUsuario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [pets, setPets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [fotoSelecionada, setFotoSelecionada] = useState("");
  const [salvandoFoto, setSalvandoFoto] = useState(false);
  const [mensagemFoto, setMensagemFoto] = useState("");
  const [petEditando, setPetEditando] = useState(null);
  const [mensagemPets, setMensagemPets] = useState("");
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [formPerfil, setFormPerfil] = useState({});
  const [mensagemPerfil, setMensagemPerfil] = useState("");

  const carregarDados = useCallback(async (conta) => {
    setUsuario(conta);

    const [resCliente, resPets] = await Promise.allSettled([
      clientesApi.meusDados(),
      animaisApi.listarMeus(),
    ]);

    setCliente(
      resCliente.status === "fulfilled" ? resCliente.value.cliente : null,
    );
    if (resCliente.status === "fulfilled") setFormPerfil({ ...resCliente.value.cliente });
    setPets(
      resPets.status === "fulfilled" ? resPets.value.animais || [] : [],
    );
  }, []);

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      try {
        const resposta = await authApi.usuarioAtual();
        if (ativo) await carregarDados(resposta.usuario);
      } catch {
        if (ativo) {
          setUsuario(null);
          setCliente(null);
          setPets([]);
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    verificarSessao();
    return () => {
      ativo = false;
    };
  }, [carregarDados]);

  async function autenticar(dadosUsuario) {
    setCarregando(true);
    try {
      await carregarDados(dadosUsuario);
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    try {
      await authApi.logout();
      avisarMudancaAutenticacao();
    } finally {
      setUsuario(null);
      setCliente(null);
      setPets([]);
    }
  }

  async function selecionarFotoPerfil(event) {
    setMensagemFoto("");
    try {
      setFotoSelecionada(await lerImagem(event.target.files?.[0]));
    } catch (error) {
      event.target.value = "";
      setMensagemFoto(error.message);
    }
  }

  async function salvarFotoPerfil() {
    if (!fotoSelecionada) return;
    setSalvandoFoto(true);
    setMensagemFoto("");
    try {
      await clientesApi.atualizarFoto(fotoSelecionada);
      const resposta = await clientesApi.meusDados();
      avisarMudancaAutenticacao();
      setCliente(resposta.cliente);
      setFotoSelecionada("");
      setMensagemFoto("Foto de perfil atualizada.");
    } catch (error) {
      setMensagemFoto(error.response?.data?.mensagem || "Não foi possível salvar a foto.");
    } finally {
      setSalvandoFoto(false);
    }
  }

  async function salvarPerfil(event) {
    event.preventDefault();
    setMensagemPerfil("");
    try {
      await clientesApi.atualizarMeusDados(formPerfil);
      const resposta = await clientesApi.meusDados();
      setCliente(resposta.cliente);
      setFormPerfil({ ...resposta.cliente });
      setEditandoPerfil(false);
      setMensagemPerfil("Perfil atualizado.");
      avisarMudancaAutenticacao();
    } catch (error) {
      setMensagemPerfil(error.response?.data?.mensagem || "Não foi possível atualizar o perfil.");
    }
  }

  async function removerConta() {
    if (!window.confirm("Deseja realmente remover sua conta? Esta ação não pode ser desfeita.")) return;
    try {
      await clientesApi.excluirMinhaConta();
      await sair();
    } catch (error) {
      setMensagemPerfil(error.response?.data?.mensagem || "Não foi possível remover a conta.");
    }
  }

  async function excluirPet(pet) {
    if (!window.confirm(`Remover ${pet.nome} da sua lista de pets?`)) return;
    setMensagemPets("");
    try {
      await animaisApi.excluir(pet.id_animal);
      await carregarDados(usuario);
      setMensagemPets("Pet removido com sucesso.");
    } catch (error) {
      setMensagemPets(error.response?.data?.mensagem || "Não foi possível remover o pet.");
    }
  }

  const nomeExibicao = cliente?.nome || usuario?.nome || "";
  const iniciaisUsuario = nomeExibicao
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toLocaleUpperCase("pt-BR"))
    .join("");

  if (carregando) {
    return (
      <div className="pages-pets">
        <Aside />
        <main className="main-pets">
          <p className="estado-pets">Carregando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="pages-pets">
      <Aside />
      <main className="main-pets">
        <div className="logo">
          <img src={Logo} alt="PetAmparo" />
        </div>

        {!usuario ? (
          <Auth
            key={modoAuth}
            initialMode={modoAuth}
            onAuthenticated={autenticar}
            redirectTo={searchParams.get("redirect") || "/"}
          />
        ) : (
          <>
            <section className="meuPerfil">
              <div className="cabecalho-meu-perfil">
                <h1>Meu perfil</h1>
              </div>
              {editandoPerfil && <form className="form-editar-perfil-cliente" onSubmit={salvarPerfil}>
                <label>
                  Nome
                  <input 
                  required 
                  value={formPerfil.nome || ""} 
                  onChange={(event) => setFormPerfil({ ...formPerfil, nome: event.target.value })} />
                </label>
                <label>
                  E-mail
                  <input 
                  required 
                  type="email" 
                  value={formPerfil.email || ""} 
                  onChange={(event) => setFormPerfil({ ...formPerfil, email: event.target.value })} />
                </label>
                <label>
                  Data de nascimento
                  <input 
                  required 
                  type="date" 
                  value={formPerfil.data_nascimento ? String(formPerfil.data_nascimento).slice(0, 10) : ""} 
                  onChange={(event) => setFormPerfil({ ...formPerfil, data_nascimento: event.target.value })} />
                </label>
                <label>
                  Telefone
                  <input 
                  required 
                  value={formPerfil.telefone || ""} 
                  onChange={(event) => setFormPerfil({ ...formPerfil, telefone: event.target.value })} />
                </label>
                <label>
                  CPF
                  <input 
                  required 
                  value={formPerfil.cpf || ""} 
                  onChange={(event) => setFormPerfil({ ...formPerfil, cpf: event.target.value })} />
                </label>
                <label>
                  Endereço
                  <input 
                  required 
                  value={formPerfil.endereco || ""} 
                  onChange={(event) => setFormPerfil({ ...formPerfil, endereco: event.target.value })} />
                </label>
                <button className="botao-principal">
                  Salvar alterações
                </button>
                <button type="button" className="botao-secundario" onClick={() => setEditandoPerfil(false)}>Cancelar</button>
              </form>}
              {mensagemPerfil && <p role="status">{mensagemPerfil}</p>}
              <div className="banner">
                <div className="sta">
                  <div className="avatar-iniciais" aria-label={nomeExibicao}>
                    {(fotoSelecionada || cliente?.foto) ? <img src={fotoSelecionada || cliente.foto} alt={`Foto de ${nomeExibicao}`} /> : iniciaisUsuario || "?"}
                  </div>
                  <div className="infos-pessoais">
                    <h2>{nomeExibicao || "Minha conta"}</h2>
                    <p>{cliente?.email || usuario.email}</p>
                    {cliente?.telefone && <p>{cliente.telefone}</p>}
                  </div>
                </div>
                <div className="foto-perfil-editar">
                  <label className="seletor-imagem">
                    Alterar foto de perfil
                    <input className="input-imagem-oculto" type="file" accept="image/png,image/jpeg,image/webp" onChange={selecionarFotoPerfil} />
                    <span className="botao-escolher-imagem">Escolher imagem</span>
                  </label>
                  {fotoSelecionada && <button className="botao-secundario" onClick={salvarFotoPerfil} disabled={salvandoFoto}>{salvandoFoto ? "Salvando..." : "Salvar foto"}</button>}
                  {mensagemFoto && <p role="status">{mensagemFoto}</p>}
                </div>
                <div className="acoes-conta-cliente">
                  <button 
                  type="button" 
                  className="botao-acao-conta" 
                  onClick={() => setEditandoPerfil((valor) => !valor)} 
                  aria-label="Editar perfil" 
                  title="Editar perfil">
                    <i className="fa-solid fa-pen" />
                  </button>
                  <button 
                  type="button" 
                  className="botao-acao-conta" 
                  onClick={removerConta} 
                  aria-label="Remover conta" 
                  title="Remover conta">
                    <i className="fa-solid fa-trash-can" />
                  </button>
                  <button 
                  type="button" 
                  className="botao-acao-conta" 
                  onClick={sair} 
                  aria-label="Sair da conta" 
                  title="Sair da conta">
                    <i className="fa-solid fa-right-from-bracket" />
                  </button>
                </div>
              </div>
            </section>

            <section className="meuspets">
              <div className="pets-cabecalho">
                <div> 
                  <h2>Meus pets</h2>
                  <p>Aqui estão os pets cadastrados na sua conta.</p>
                </div>
              </div>

              {pets.length > 0 ? (
                <div className="lista-pets">
                  {pets.map((pet) => (
                    <article className="card-pet" key={pet.id_animal}>
                      <div className="pet-identidade">
                        {pet.foto ? <img className="foto-pet" src={pet.foto} alt={`Foto de ${pet.nome}`} /> : <div className="foto-pet pet-sem-foto" aria-hidden="true"><i className="fa-solid fa-paw" /></div>}
                        <div><h3>{pet.nome}</h3><p>{[pet.especie, pet.raca].filter(Boolean).join(" · ")}</p></div>
                      </div>
                      <div className="pet-detalhes">
                        <span>{pet.idade === 1 ? "1 ano" : `${pet.idade} anos`}</span>
                        <span>{pet.sexo === "F" ? "Fêmea" : pet.sexo === "M" ? "Macho" : "Sexo não informado"}</span>
                        <span className={pet.e_vacinado ? "vacinado" : "pendente-vacina"}>{pet.e_vacinado ? "Vacinado" : "Vacinação pendente"}</span>
                      </div>
                      <div className="acoes-pet">
                        <button type="button" className="botao-secundario" onClick={() => setPetEditando(pet)} aria-label={`Editar ${pet.nome}`} title="Editar"><i className="fa-solid fa-pen" /></button>
                        <button type="button" className="botao-secundario" onClick={() => excluirPet(pet)} aria-label={`Remover ${pet.nome}`} title="Remover"><i className="fa-solid fa-trash-can" /></button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="estado-pets">
                  Você ainda não cadastrou nenhum pet.
                </p>
              )}

              {mensagemPets && <p role="status">{mensagemPets}</p>}
              {petEditando ? (
                <CadastroPet key={petEditando.id_animal} pet={petEditando} onCancel={() => setPetEditando(null)} onSaved={async () => { setPetEditando(null); await carregarDados(usuario); }} />
              ) : (
                <CadastroPet onSaved={() => carregarDados(usuario)} />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

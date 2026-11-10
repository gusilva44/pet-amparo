import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Aside from "../components/aside/aside";
import Calendario from "../components/calendario/calendario";
import AgendamentosMes from "../components/agendamentos/agendamentos";
import Logo from "../assets/imagens/Logo.webp";
import {
  agendamentosApi,
  authApi,
  animaisApi,
  unidadesApi,
  veterinariosApi,
} from "../services/api";
import { mensagemErroApi } from "../utils/api";
import unidades from "../data/unidades";
import "../scss/unidades.scss";

const abas = [
  "Servi\u00e7os",
  "Agendamentos",
  "O que levar?",
  "Sobre a unidade",
];

function dataLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function dataPassada(data) {
  return data < dataLocal(new Date());
}

function formatarAgendamento(item) {
  const inicio = new Date(item.inicio);
  const servico = item.servico || item.nome_servico || "Atendimento";
  const nomeServico = typeof servico === "object" ? servico.nome : servico;
  return {
    ...item,
    id: item.id_agendamento,
    pet: item.animal || item.nome_animal || item.pet || "Pet",
    tipo: nomeServico,
    tipoCor: /vacina/i.test(nomeServico) ? "vacinacao" : "consulta",
    data: dataLocal(inicio),
    horario: inicio.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    unidade: item.unidade || "",
    endereco: item.endereco || "",
    status: item.situacao || item.status || "Pendente",
  };
}

export default function Unidades() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [unidade, setUnidade] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [aba, setAba] = useState(() => abas.includes(searchParams.get("aba")) ? searchParams.get("aba") : "Servi\u00e7os");
  const [aberto, setAberto] = useState(null);
  const [erro, setErro] = useState("");
  const [mesAtual, setMesAtual] = useState(() => new Date());
  const [dataSelecionada, setDataSelecionada] = useState(dataLocal(new Date()));
  const [pets, setPets] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [veterinarios, setVeterinarios] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [horariosVeterinario, setHorariosVeterinario] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [opcoesHorario, setOpcoesHorario] = useState([]);
  const [idPet, setIdPet] = useState("");
  const [idVeterinario, setIdVeterinario] = useState("");
  const [idServico, setIdServico] = useState("");
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setErro("");
      try {
        const [resUnidade, resUnidades] = await Promise.all([
          unidadesApi.buscarPorId(id),
          unidadesApi.listarPublicasComServicos(),
        ]);
        if (!ativo) return;
        setUnidade(resUnidade.resultado);
        const registro = resUnidades.resultado?.find(
          (item) => String(item.id_unidade) === String(id),
        );
        setServicos(registro?.servicos ?? []);
      } catch (error) {
        if (ativo) setErro(mensagemErroApi(error));
      }
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, [id]);

  useEffect(() => {
    if (aba !== "Agendamentos") return undefined;
    let ativo = true;
    async function carregarAgenda() {
      const [resVeterinarios, resUsuario] = await Promise.allSettled([
        veterinariosApi.listar(id),
        authApi.usuarioAtual(),
      ]);
      if (!ativo) return;
      const listaVets =
        resVeterinarios.status === "fulfilled"
          ? resVeterinarios.value.veterinarios ||
            resVeterinarios.value.resultado ||
            []
          : [];
      setVeterinarios(listaVets);
      if (resUsuario.status !== "fulfilled") {
        setUsuario(null);
        setPets([]);
        setAgendamentos([]);
        return;
      }
      const conta = resUsuario.value.usuario;
      setUsuario(conta);
      if (conta?.tipo !== "cliente") {
        setPets([]);
        setAgendamentos([]);
        return;
      }

      const [resPets, resAgendamentos] = await Promise.allSettled([
        animaisApi.listarMeus(),
        agendamentosApi.listarMeus(),
      ]);
      if (!ativo) return;
      const listaPets = resPets.status === "fulfilled"
        ? resPets.value.animais || resPets.value.resultado || []
        : [];
      const listaAgendamentos = resAgendamentos.status === "fulfilled"
        ? resAgendamentos.value.agendamentos || resAgendamentos.value.resultado || []
        : [];
      setPets(listaPets);
      setAgendamentos(listaAgendamentos
        .filter((item) => Number(item.id_unidade) === Number(id))
        .map(formatarAgendamento));
      if (resPets.status === "rejected") setMensagem(mensagemErroApi(resPets.reason));
      else if (resAgendamentos.status === "rejected") setMensagem(mensagemErroApi(resAgendamentos.reason));
    }
    carregarAgenda();
    return () => {
      ativo = false;
    };
  }, [aba, id]);

  useEffect(() => {
    if (!idServico || !servicos.some((servico) => String(servico.id_servico) === String(idServico))) {
      setIdServico(servicos.length ? String(servicos[0].id_servico) : "");
      setHorarioSelecionado("");
    }
  }, [servicos, idServico]);

  useEffect(() => {
    if (!idVeterinario || !veterinarios.some((vet) => String(vet.id_veterinario) === String(idVeterinario))) {
      setIdVeterinario(veterinarios.length ? String(veterinarios[0].id_veterinario) : "");
      setHorarioSelecionado("");
    }
  }, [veterinarios, idVeterinario]);

  useEffect(() => {
    if (!idPet || !pets.some((pet) => String(pet.id_animal) === String(idPet))) {
      setIdPet(pets.length ? String(pets[0].id_animal) : "");
    }
  }, [pets, idPet]);

  useEffect(() => {
    if (!idVeterinario) {
      setHorariosVeterinario([]);
      return undefined;
    }
    let ativo = true;
    setCarregandoHorarios(true);
    veterinariosApi.listarHorarios(idVeterinario)
      .then((res) => {
        if (ativo) setHorariosVeterinario((res.resultado || []).filter((horario) => Number(horario.id_unidade) === Number(id)));
      })
      .catch((error) => {
        if (ativo) {
          setHorariosVeterinario([]);
          setMensagem(mensagemErroApi(error));
        }
      })
      .finally(() => { if (ativo) setCarregandoHorarios(false); });
    return () => { ativo = false; };
  }, [id, idVeterinario]);

  useEffect(() => {
    if (!idVeterinario || !idServico || !dataSelecionada || dataPassada(dataSelecionada)) {
      setOpcoesHorario([]);
      return undefined;
    }
    let ativo = true;
    agendamentosApi.disponibilidade({
      id_veterinario: idVeterinario,
      id_unidade: id,
      id_servico: idServico,
      data: dataSelecionada,
    }).then((res) => {
      if (ativo) setOpcoesHorario(res.horarios || []);
    }).catch((error) => {
      if (ativo) {
        setOpcoesHorario([]);
        setMensagem(mensagemErroApi(error));
      }
    });
    return () => { ativo = false; };
  }, [id, idVeterinario, idServico, dataSelecionada]);
  const agendamentoSelecionado = agendamentos.find(
    (item) => item.data === dataSelecionada,
  ) || { data: dataSelecionada };
  const diasDisponiveisVet = idVeterinario
    ? [...new Set(horariosVeterinario.map((horario) => Number(horario.dia_semana)))]
    : undefined;

  async function confirmarAgendamento(event) {
    event.preventDefault();
    setMensagem("");
    if (dataPassada(dataSelecionada)) {
      setMensagem(
        "N\u00e3o \u00e9 poss\u00edvel agendar em uma data que j\u00e1 passou.",
      );
      return;
    }
    if (!idPet || !idVeterinario || !idServico || !horarioSelecionado) {
      setMensagem(
        "Selecione seu pet, um servi\u00e7o, veterin\u00e1rio e hor\u00e1rio dispon\u00edvel.",
      );
      return;
    }
    setSalvando(true);
    try {
      if (usuario?.tipo !== "cliente") {
        setMensagem("Entre na sua conta de cliente para solicitar o agendamento.");
        return;
      }
      const inicio = `${dataSelecionada}T${horarioSelecionado}:00`;
      await agendamentosApi.criar({
        id_animal: Number(idPet),
        id_veterinario: Number(idVeterinario),
        id_servico: Number(idServico),
        id_unidade: Number(id),
        inicio,
        observacao,
      });
      setMensagem("Agendamento solicitado com sucesso.");
      setHorarioSelecionado("");
      setObservacao("");
      const res = await agendamentosApi.listarMeus();
      setAgendamentos(
        (res.agendamentos || res.resultado || [])
          .filter((item) => Number(item.id_unidade) === Number(id))
          .map(formatarAgendamento),
      );
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setSalvando(false);
    }
  }

  if (erro)
    return (
      <div className="pagina-unidade">
        <Aside />
        <main className="unidade-main">
          <img className="unidade-logo" src={Logo} alt="Pet Amparo" />
          <div className="unidade-mensagem">
            <h1>N&#227;o foi poss&#237;vel carregar a unidade</h1>
            <p>{erro}</p>
            <Link to="/">Voltar para o in&#237;cio</Link>
          </div>
        </main>
      </div>
    );
  if (!unidade)
    return (
      <div className="pagina-unidade">
        <Aside />
        <main className="unidade-main">
          <img className="unidade-logo" src={Logo} alt="Pet Amparo" />
          <p className="unidade-carregando">Carregando unidade...</p>
        </main>
      </div>
    );

  const endereco = [
    unidade.endereco,
    unidade.numero,
    unidade.complemento,
    unidade.bairro,
    unidade.cidade,
    unidade.estado,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="pagina-unidade">
      <Aside />
      <main className="unidade-main">
        <img className="unidade-logo" src={Logo} alt="Pet Amparo" />
        <article className="unidade-card">
          <section className="unidade-cabecalho">
          <div className="unidade-foto"
            style={{
              backgroundImage: `url(${unidades.find((card) => String(card.id) === String(id))?.img || unidades[0].img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            aria-hidden="true"></div>
            <div className="unidade-dados">
              <h1>{unidade.nome}</h1>
              {unidade.descricao && (
                <p className="unidade-descricao">{unidade.descricao}</p>
              )}
              <div className="unidade-info-grid">
                {unidade.telefone && (
                  <p>
                    <span aria-hidden="true">&#9742;</span>
                    <a href={`tel:${unidade.telefone}`}>{unidade.telefone}</a>
                  </p>
                )}
                {unidade.email && (
                  <p>
                    <span aria-hidden="true">&#9993;</span>
                    <a href={`mailto:${unidade.email}`}>{unidade.email}</a>
                  </p>
                )}
                <p className="unidade-endereco">
                  <span aria-hidden="true">&#8982;</span>
                  {endereco}
                </p>
                {unidade.cep && (
                  <p className="unidade-cep">CEP {unidade.cep}</p>
                )}
              </div>
            </div>
          </section>
          <nav
            className="unidade-abas"
            aria-label="Informa&#231;&#245;es da unidade"
          >
            {abas.map((item) => (
              <button
                key={item}
                type="button"
                className={aba === item ? "ativa" : ""}
                onClick={() => {
                  setAba(item);
                  setMensagem("");
                }}
              >
                {item}
              </button>
            ))}
          </nav>
          <section className="unidade-conteudo">
            {aba === "Servi\u00e7os" && (
              <>
                <h2>Servi&#231;os oferecidos</h2>
                {servicos.length ? (
                  <div className="servicos-lista">
                    {servicos.map((servico, index) => {
                      const expandido =
                        aberto === (servico.id_servico ?? index);
                      return (
                        <article
                          className={
                            "servico-item " + (expandido ? "expandido" : "")
                          }
                          key={servico.id_servico ?? index}
                        >
                          <button
                            type="button"
                            aria-expanded={expandido}
                            onClick={() =>
                              setAberto(
                                expandido
                                  ? null
                                  : (servico.id_servico ?? index),
                              )
                            }
                          >
                            <span className="servico-icone" aria-hidden="true">
                              &#10010;
                            </span>
                            <span className="servico-texto">
                              <strong>{servico.nome}</strong>
                              {expandido && (
                                <small>
                                  {servico.descricao ||
                                    "Atendimento veterin\u00e1rio para cuidar da sa\u00fade do seu pet."}
                                  {servico.duracao_minutos
                                    ? ` Dura\u00e7\u00e3o aproximada: ${servico.duracao_minutos} minutos.`
                                    : ""}
                                </small>
                              )}
                            </span>
                            <span className="servico-seta" aria-hidden="true">
                              {expandido ? "^" : ">"}
                            </span>
                          </button>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="unidade-vazio">
                    Nenhum servi&#231;o dispon&#237;vel para esta unidade no
                    momento.
                  </p>
                )}
              </>
            )}
            {aba === "Agendamentos" && (
              <div className="agenda-unidade">
                <h2>Agende sua consulta na {unidade.nome}</h2>
                <p className="agenda-intro">
                  Esta agenda mostra somente os atendimentos desta unidade.
                  Escolha uma data e preencha os dados do seu pet.
                </p>
                <Calendario
                  mesAtual={mesAtual}
                  dataMinima={dataLocal(new Date())}
                  diasDisponiveis={diasDisponiveisVet}
                  agendamentos={agendamentos}
                  agendamentoSelecionado={agendamentoSelecionado}
                  onSelecionar={(item) => {
                    if (!dataPassada(item.data)) setDataSelecionada(item.data);
                  }}
                  onSelecionarData={(data) => {
                    if (!dataPassada(data)) {
                      setDataSelecionada(data);
                      setHorarioSelecionado("");
                    }
                  }}
                  onMudarMes={(direcao) => {
                    const proximo = new Date(
                      mesAtual.getFullYear(),
                      mesAtual.getMonth() + direcao,
                      1,
                    );
                    setMesAtual(proximo);
                    setDataSelecionada(dataLocal(proximo));
                    setHorarioSelecionado("");
                  }}
                />
                <AgendamentosMes
                  agendamentos={agendamentos}
                  mesAtual={mesAtual}
                />
                {dataPassada(dataSelecionada) && (
                  <p className="agenda-aviso">
                    Selecione hoje ou uma data futura para agendar.
                  </p>
                )}
                <form
                  className="form-agenda-unidade"
                  onSubmit={confirmarAgendamento}
                >
                  <h3>
                    Solicitar atendimento -{" "}
                    {new Date(`${dataSelecionada}T12:00:00`).toLocaleDateString(
                      "pt-BR",
                    )}
                  </h3>
                  {!usuario ? (
                    <p>Para agendar, <Link className="agenda-link-login" to={`/meuspets?modo=login&redirect=${encodeURIComponent(`/unidades/${id}?aba=Agendamentos`)}`}>entre na sua conta de cliente</Link> e cadastre um pet.</p>
                  ) : usuario.tipo !== "cliente" ? (
                    <p>O agendamento está disponível para contas de cliente.</p>
                  ) : !pets.length ? (
                    <p>Cadastre um pet em <Link className="agenda-link-login" to="/meuspets?modo=cadastro">Meus Pets</Link> para continuar.</p>
                  ) : (
                    <label>
                      Pet
                      <select
                        value={idPet}
                        onChange={(event) => setIdPet(event.target.value)}
                        required
                      >
                        <option value="">Selecione seu pet</option>
                        {pets.map((pet) => (
                          <option key={pet.id_animal} value={pet.id_animal}>
                            {pet.nome}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label>
                    Servi&#231;o
                    <select
                      value={idServico}
                      onChange={(event) => {
                        setIdServico(event.target.value);
                        setHorarioSelecionado("");
                      }}
                      required
                    >
                      <option value="">Selecione um servi&#231;o</option>
                      {servicos.map((servico) => (
                        <option
                          key={servico.id_servico}
                          value={servico.id_servico}
                        >
                          {servico.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Veterin&#225;rio
                    <select
                      value={idVeterinario}
                      onChange={(event) => {
                        setIdVeterinario(event.target.value);
                        setHorarioSelecionado("");
                      }}
                      required
                    >
                      <option value="">Selecione um veterin&#225;rio</option>
                      {veterinarios.map((vet) => (
                        <option
                          key={vet.id_veterinario}
                          value={vet.id_veterinario}
                        >
                          {vet.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="agenda-disponibilidade-vet" aria-live="polite">
                    <strong>Disponibilidade de {veterinarios.find((vet) => String(vet.id_veterinario) === String(idVeterinario))?.nome || ""}</strong>
                    {carregandoHorarios ? <span>Carregando disponibilidade...</span> : horariosVeterinario.length ? (
                      <ul>
                        {[...new Set(horariosVeterinario.map((horario) => Number(horario.dia_semana)))].sort((a, b) => a - b).map((dia) => {
                          const nomeDia = ["", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"][dia];
                          const faixas = horariosVeterinario.filter((horario) => Number(horario.dia_semana) === dia).map((horario) => `${String(horario.hora_inicio).slice(0, 5)}–${String(horario.hora_fim).slice(0, 5)}`).join(", ");
                          return <li key={dia}><span>{nomeDia}</span><span>{faixas}</span></li>;
                        })}
                      </ul>
                    ) : <span>Este veterinário ainda não cadastrou dias e horários nesta unidade.</span>}
                  </div>
                  <label>
                    Hor&#225;rio dispon&#237;vel
                    <select
                      value={horarioSelecionado}
                      onChange={(event) =>
                        setHorarioSelecionado(event.target.value)
                      }
                      required
                    >
                      <option value="">Selecione um hor&#225;rio</option>
                      {opcoesHorario.map((horario) => (
                        <option key={horario} value={horario}>
                          {horario}
                        </option>
                      ))}
                    </select>
                  </label>
                  {!opcoesHorario.length && idVeterinario && (
                    <p className="agenda-aviso">
                      N&#227;o h&#225; hor&#225;rios dispon&#237;veis para este
                      profissional nesta data. Escolha outro dia no
                      calend&#225;rio.
                    </p>
                  )}
                  <label className="agenda-observacao">
                    Observa&#231;&#227;o (opcional)
                    <textarea
                      value={observacao}
                      onChange={(event) => setObservacao(event.target.value)}
                      rows="3"
                      placeholder="Conte algo importante sobre seu pet"
                    />
                  </label>
                  {mensagem && (
                    <p className="agenda-mensagem" role="status">
                      {mensagem}
                    </p>
                  )}
                  <button
                    className="agenda-submit"
                    type="submit"
                    disabled={
                      salvando ||
                      dataPassada(dataSelecionada) ||
                      !opcoesHorario.length ||
                      usuario?.tipo !== "cliente" ||
                      !pets.length ||
                      !servicos.length ||
                      !veterinarios.length
                    }
                  >
                    {salvando ? "Enviando..." : "Agendar atendimento"}
                  </button>
                </form>
                {(!servicos.length || !veterinarios.length) && (
                  <p className="agenda-aviso">
                    {!servicos.length
                      ? "Esta unidade n\u00e3o tem servi\u00e7os dispon\u00edveis."
                      : "N\u00e3o h\u00e1 veterin\u00e1rios cadastrados para esta unidade."}
                  </p>
                )}
              </div>
            )}
            {aba === "O que levar?" && (
              <div className="unidade-sobre">
                <h2>O que levar para o atendimento?</h2>
                <ul className="lista-levar">
                  <li>
                    Documento de identifica&#231;&#227;o do respons&#225;vel.
                  </li>
                  <li>Seu pet com coleira ou caixa de transporte adequada.</li>
                  <li>
                    Carteira de vacina&#231;&#227;o e exames anteriores, se
                    tiver.
                  </li>
                  <li>Lista de medicamentos que o pet utiliza.</li>
                  <li>Chegue alguns minutos antes do hor&#225;rio agendado.</li>
                </ul>
                <p>
                  Se o pet tiver alguma necessidade especial, informe a equipe
                  da unidade ao chegar.
                </p>
              </div>
            )}
            {aba === "Sobre a unidade" && (
              <div className="unidade-sobre">
                <h2>Sobre a unidade</h2>
                <p>
                  {unidade.descricao ||
                    "Consulte os dados de contato e localiza\u00e7\u00e3o desta unidade."}
                </p>
                <p>
                  <strong>Endere&#231;o:</strong> {endereco}
                </p>
                {unidade.telefone && (
                  <p>
                    <strong>Telefone:</strong> {unidade.telefone}
                  </p>
                )}
                {unidade.email && (
                  <p>
                    <strong>E-mail:</strong> {unidade.email}
                  </p>
                )}
              </div>
            )}
          </section>
        </article>
      </main>
    </div>
  );
}

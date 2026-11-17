
import { useCallback, useEffect, useState } from "react";
import { unidadesApi, veterinariosApi } from "../../../services/api";
import { mensagemErroApi } from "../../../utils/api";
import "./index.scss";

function requisicaoComTimeout(promessa, nome, tempo = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `A requisição "${nome}" demorou mais de ${tempo / 1000} segundos.`
        )
      );
    }, tempo);

    Promise.resolve(promessa)
      .then((resultado) => {
        clearTimeout(timer);
        resolve(resultado);
      })
      .catch((erro) => {
        clearTimeout(timer);
        reject(erro);
      });
  });
}

export default function DisponibilidadeVeterinario() {
  const [unidades, setUnidades] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [catalogoUnidades, setCatalogoUnidades] = useState([]);
  const [horarios, setHorarios] = useState([]);

  const [form, setForm] = useState({
    id_unidade: "",
    datas: [""],
    hora_inicio: "09:00",
    hora_fim: "17:00",
    ids_servicos: [],
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setMensagem("");

    try {
      const resultados = await Promise.allSettled([
        requisicaoComTimeout(
          veterinariosApi.minhasUnidades(),
          "Minhas unidades"
        ),
        requisicaoComTimeout(
          veterinariosApi.meusHorarios(),
          "Meus horários"
        ),
        requisicaoComTimeout(
          unidadesApi.listarPublicasComServicos(),
          "Catálogo de unidades"
        ),
      ]);

      const [resUnidades, resHorarios, resCatalogo] = resultados;
      const erros = [];

      // Carregar unidades vinculadas ao veterinário
      if (resUnidades.status === "fulfilled") {
        const lista = resUnidades.value.resultado || [];

        setUnidades(lista);

        setForm((atual) => ({
          ...atual,
          id_unidade:
            atual.id_unidade ||
            String(lista[0]?.id_unidade || ""),
        }));
      } else {
        setUnidades([]);
        erros.push(
          `Unidades: ${mensagemErroApi(resUnidades.reason)}`
        );
      }

      // Carregar horários cadastrados
      if (resHorarios.status === "fulfilled") {
        setHorarios(resHorarios.value.resultado || []);
      } else {
        setHorarios([]);
        erros.push(
          `Horários: ${mensagemErroApi(resHorarios.reason)}`
        );
      }

      // Carregar catálogo de unidades e serviços
      if (resCatalogo.status === "fulfilled") {
        setCatalogoUnidades(resCatalogo.value.resultado || []);
      } else {
        setCatalogoUnidades([]);
        erros.push(
          `Serviços: ${mensagemErroApi(resCatalogo.reason)}`
        );
      }

      if (erros.length) {
        setMensagem(erros.join(" | "));
      }
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  // Atualizar serviços conforme a unidade selecionada
  useEffect(() => {
    const unidade = catalogoUnidades.find(
      (item) =>
        Number(item.id_unidade) === Number(form.id_unidade)
    );

    const listaServicos = unidade?.servicos || [];

    setServicos(listaServicos);

    setForm((atual) => ({
      ...atual,
      ids_servicos: atual.ids_servicos.filter((id) =>
        listaServicos.some(
          (servico) => String(servico.id_servico) === id
        )
      ),
    }));
  }, [catalogoUnidades, form.id_unidade]);

  // Carregar informações ao abrir a página
  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar(event) {
    event.preventDefault();

    setSalvando(true);
    setMensagem("");

    try {
      const datas = [...new Set(form.datas.filter(Boolean))];

      if (!form.id_unidade) {
        throw new Error("Selecione uma unidade.");
      }

      if (!datas.length) {
        throw new Error("Adicione ao menos uma data disponível.");
      }

      if (!form.ids_servicos.length) {
        throw new Error("Selecione ao menos um serviço.");
      }

      if (form.hora_inicio >= form.hora_fim) {
        throw new Error(
          "O horário de início precisa ser anterior ao horário de fim."
        );
      }

      const resultados = await Promise.allSettled(
        datas.map((data) =>
          veterinariosApi.criarMeuHorario({
            id_unidade: Number(form.id_unidade),
            data,
            hora_inicio: form.hora_inicio,
            hora_fim: form.hora_fim,
            ids_servicos: form.ids_servicos.map(Number),
          })
        )
      );

      const salvas = resultados.filter(
        (resultado) => resultado.status === "fulfilled"
      ).length;

      const falhas = resultados.filter(
        (resultado) => resultado.status === "rejected"
      );

      await carregar();

      setForm((atual) => ({
        ...atual,
        datas: [""],
      }));

      if (falhas.length) {
        const detalhe = mensagemErroApi(falhas[0].reason);

        setMensagem(
          `${salvas} de ${datas.length} datas salvas. ${detalhe}`
        );
      } else {
        setMensagem(
          `Disponibilidade adicionada para ${datas.length} ${
            datas.length === 1 ? "data" : "datas"
          }.`
        );
      }
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id) {
    setRemovendo(id);
    setMensagem("");

    try {
      await veterinariosApi.excluirMeuHorario(id);

      setHorarios((atuais) =>
        atuais.filter(
          (horario) => horario.id_horario !== id
        )
      );

      setMensagem("Disponibilidade removida.");
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setRemovendo(null);
    }
  }

  return (
    <section className="disponibilidade-veterinario">
      <header>
        <h2>Minha disponibilidade</h2>
        <p>
          Defina em quais dias, horários e unidades os clientes
          podem marcar consultas com você.
        </p>
      </header>

      {carregando ? (
        <p className="disponibilidade-vazia">
          Carregando informações...
        </p>
      ) : unidades.length === 0 ? (
        <p className="disponibilidade-vazia">
          Você ainda não está vinculado a uma unidade. Peça ao
          administrador para associar seu cadastro a uma unidade.
        </p>
      ) : (
        <form
          className="form-disponibilidade"
          onSubmit={salvar}
        >
          <label>
            Unidade

            <select
              required
              value={form.id_unidade}
              onChange={(event) =>
                setForm((atual) => ({
                  ...atual,
                  id_unidade: event.target.value,
                }))
              }
            >
              <option value="" disabled>
                Selecione uma unidade
              </option>

              {unidades.map((unidade) => (
                <option
                  key={unidade.id_unidade}
                  value={unidade.id_unidade}
                >
                  {unidade.nome}
                </option>
              ))}
            </select>
          </label>

          <div className="datas-disponibilidade">
            <span className="rotulo-datas">
              Datas disponíveis
            </span>

            {form.datas.map((data, indice) => (
              <div
                className="campo-data-disponibilidade"
                key={indice}
              >
                <input
                  aria-label={`Data disponível ${indice + 1}`}
                  type="date"
                  required
                  value={data}
                  min={new Date().toLocaleDateString("en-CA")}
                  onChange={(event) =>
                    setForm((atual) => ({
                      ...atual,
                      datas: atual.datas.map((item, i) =>
                        i === indice
                          ? event.target.value
                          : item
                      ),
                    }))
                  }
                />

                {form.datas.length > 1 && (
                  <button
                    type="button"
                    className="remover-data"
                    onClick={() =>
                      setForm((atual) => ({
                        ...atual,
                        datas: atual.datas.filter(
                          (_, i) => i !== indice
                        ),
                      }))
                    }
                    aria-label={`Remover data ${indice + 1}`}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="adicionar-data"
              onClick={() =>
                setForm((atual) => ({
                  ...atual,
                  datas: [...atual.datas, ""],
                }))
              }
            >
              Adicionar outra data
            </button>
          </div>

          <label>
            Início

            <input
              type="time"
              required
              value={form.hora_inicio}
              onChange={(event) =>
                setForm((atual) => ({
                  ...atual,
                  hora_inicio: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Fim

            <input
              type="time"
              required
              value={form.hora_fim}
              onChange={(event) =>
                setForm((atual) => ({
                  ...atual,
                  hora_fim: event.target.value,
                }))
              }
            />
          </label>

          <fieldset className="servicos-disponibilidade">
            <legend>Serviços que atenderá nesta data</legend>

            {servicos.length === 0 ? (
              <p>
                Nenhum serviço disponível para esta unidade.
              </p>
            ) : (
              servicos.map((servico) => (
                <label
                  key={servico.id_servico}
                  className="servico-opcao"
                >
                  <input
                    type="checkbox"
                    checked={form.ids_servicos.includes(
                      String(servico.id_servico)
                    )}
                    onChange={(event) =>
                      setForm((atual) => ({
                        ...atual,
                        ids_servicos: event.target.checked
                          ? [
                              ...atual.ids_servicos,
                              String(servico.id_servico),
                            ]
                          : atual.ids_servicos.filter(
                              (id) =>
                                id !== String(servico.id_servico)
                            ),
                      }))
                    }
                  />

                  {servico.nome}
                </label>
              ))
            )}
          </fieldset>

          <button
            type="submit"
            disabled={
              salvando ||
              carregando ||
              !unidades.length ||
              !form.ids_servicos.length
            }
          >
            {salvando ? "Salvando..." : "Adicionar horário"}
          </button>
        </form>
      )}

      {mensagem && (
        <p
          className="mensagem-disponibilidade"
          role="status"
        >
          {mensagem}
        </p>
      )}

      <div className="lista-disponibilidade">
        <h3>Horários cadastrados</h3>

        {carregando ? (
          <p>Carregando disponibilidade...</p>
        ) : horarios.length === 0 ? (
          <p>Nenhum dia ou horário cadastrado.</p>
        ) : (
          horarios.map((horario) => (
            <article key={horario.id_horario}>
              <div>
                <strong>
                  {horario.data_disponivel
                    ? new Date(
                        `${String(horario.data_disponivel).slice(0, 10)}T12:00:00`
                      ).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Disponibilidade recorrente"}
                </strong>

                <span>
                  {horario.unidade_nome ||
                    unidades.find(
                      (unidade) =>
                        Number(unidade.id_unidade) ===
                        Number(horario.id_unidade)
                    )?.nome}
                </span>

                <span>
                  {horario.servicos_nomes || "Todos os serviços"}
                </span>
              </div>

              <time>
                {String(horario.hora_inicio).slice(0, 5)}
                {"–"}
                {String(horario.hora_fim).slice(0, 5)}
              </time>

              <button
                type="button"
                onClick={() => excluir(horario.id_horario)}
                disabled={removendo === horario.id_horario}
                aria-label="Remover horário"
              >
                {removendo === horario.id_horario
                  ? "Removendo..."
                  : "Remover"}
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
import { chaveDoDia, ehHoje, formatarDataCurta, formatarHora, rotuloDoDia } from "../../../utils/data";
import "./cartaoAgendamento.scss";

const ROTULOS_SEXO = {
    M: "Macho",
    F: "Fêmea",
    desconhecido: "Não informado"
};

const ROTULOS_PORTE = {
    pequeno: "Porte pequeno",
    medio: "Porte médio",
    grande: "Porte grande",
    nao_informado: "Porte não informado"
};

function vacinado(agendamento) {
    return Number(agendamento.e_vacinado) === 1 || agendamento.e_vacinado === true;
}

export default function CartaoAgendamento({
    agendamento,
    atualizando,
    onAlterarSituacao,
    destacarDia
}) {
    const concluido = agendamento.situacao === "concluido";
    const cancelado = agendamento.situacao === "cancelado";
    const mesmoDia = destacarDia && chaveDoDia(agendamento.inicio) === destacarDia;

    return (
        <article
            className={`cartao-agendamento ${concluido ? "concluido" : ""} ${
                cancelado ? "cancelado" : ""
            } ${mesmoDia ? "destacado" : ""}`}
        >
            <div className="horario">
                <strong>{formatarHora(agendamento.inicio)}</strong>
                <small>{formatarHora(agendamento.fim)}</small>
                <span className="dia">{formatarDataCurta(agendamento.inicio)}</span>
            </div>

            <div className="corpo">
                <div className="cabecalho-cartao">
                    <div className="pet">
                        <div className="avatar-pet">
                            {agendamento.animal_foto ? (
                                <img src={agendamento.animal_foto} alt={agendamento.animal} />
                            ) : (
                                <i className="fa-solid fa-paw"></i>
                            )}
                        </div>

                        <div className="dados-pet">
                            <h3>{agendamento.animal}</h3>
                            <p>
                                {agendamento.especie || "Espécie não informada"}
                                {agendamento.raca ? ` · ${agendamento.raca}` : ""}
                            </p>
                        </div>
                    </div>

                    <span className={`selo-situacao ${agendamento.situacao}`}>
                        {concluido ? "Concluído" : cancelado ? "Cancelado" : "Pendente"}
                    </span>
                </div>

                <div className="etiquetas">
                    <span className={vacinado(agendamento) ? "etiqueta vacinado" : "etiqueta alerta"}>
                        <i className="fa-solid fa-syringe"></i>
                        {vacinado(agendamento) ? "Vacinado" : "Não vacinado"}
                    </span>

                    <span className="etiqueta">
                        <i className="fa-solid fa-venus-mars"></i>
                        {ROTULOS_SEXO[agendamento.sexo] || "Não informado"}
                    </span>

                    <span className="etiqueta">
                        <i className="fa-solid fa-ruler-vertical"></i>
                        {ROTULOS_PORTE[agendamento.porte] || "Porte não informado"}
                    </span>

                    {agendamento.idade ? (
                        <span className="etiqueta">
                            <i className="fa-regular fa-calendar"></i>
                            {agendamento.idade} {Number(agendamento.idade) === 1 ? "ano" : "anos"}
                        </span>
                    ) : null}

                    {agendamento.rga ? (
                        <span className="etiqueta">
                            <i className="fa-solid fa-hashtag"></i>
                            RGA {agendamento.rga}
                        </span>
                    ) : null}
                </div>

                <div className="detalhes">
                    <div className="bloco">
                        <span className="rotulo">Tutor</span>
                        <strong>{agendamento.cliente}</strong>
                        <small>
                            <i className="fa-solid fa-phone"></i>
                            {agendamento.cliente_telefone || "Telefone não informado"}
                        </small>
                    </div>

                    <div className="bloco">
                        <span className="rotulo">Procedimento</span>
                        <strong>{agendamento.servico}</strong>
                        <small>
                            <i className="fa-solid fa-hospital"></i>
                            {agendamento.unidade}
                        </small>
                    </div>
                </div>

                {agendamento.observacao && (
                    <p className="observacao">
                        <i className="fa-regular fa-comment-dots"></i>
                        {agendamento.observacao}
                    </p>
                )}

                {ehHoje(agendamento.inicio) && !concluido && !cancelado && (
                    <p className="aviso-hoje">
                        <i className="fa-solid fa-circle-info"></i>
                        Atendimento de hoje — {rotuloDoDia(agendamento.inicio)}
                    </p>
                )}
            </div>

            <div className="acoes">
                <button
                    type="button"
                    className="concluir"
                    disabled={atualizando || cancelado || concluido}
                    onClick={() => onAlterarSituacao(agendamento, "concluido")}
                >
                    {atualizando ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                        <i className="fa-solid fa-check"></i>
                    )}
                    Concluir
                </button>

                <button
                    type="button"
                    className="reabrir"
                    disabled={atualizando || cancelado || !concluido}
                    onClick={() => onAlterarSituacao(agendamento, "pendente")}
                >
                    <i className="fa-solid fa-rotate-left"></i>
                    Deixar pendente
                </button>
            </div>
        </article>
    );
}

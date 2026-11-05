import { useCallback, useEffect, useState } from "react";
import { veterinariosApi } from "../../services/api";
import { mensagemErroApi } from "../../utils/api";

function extrairLista(resposta) {
    return resposta?.agendamentos || resposta?.resultado?.agendamentos || [];
}

export default function useAgendamentosVeterinario() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState("");
    const [atualizandoId, setAtualizandoId] = useState(null);

    const carregar = useCallback(async () => {
        try {
            setCarregando(true);
            setMensagem("");

            const resposta = await veterinariosApi.meusAgendamentos();
            setAgendamentos(extrairLista(resposta));
        } catch (error) {
            setMensagem(mensagemErroApi(error));
            setAgendamentos([]);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const alterarSituacao = useCallback(async (agendamento, situacao) => {
        const status = situacao === "concluido" ? "concluido" : "pendente";

        if (agendamento.situacao === status) return;

        try {
            setAtualizandoId(agendamento.id_agendamento);
            setMensagem("");

            await veterinariosApi.atualizarStatusAgendamento(
                agendamento.id_agendamento,
                status
            );

            setAgendamentos((anteriores) =>
                anteriores.map((item) =>
                    item.id_agendamento === agendamento.id_agendamento
                        ? { ...item, situacao: status, status }
                        : item
                )
            );
        } catch (error) {
            setMensagem(mensagemErroApi(error));
        } finally {
            setAtualizandoId(null);
        }
    }, []);

    return {
        agendamentos,
        carregando,
        mensagem,
        atualizandoId,
        recarregar: carregar,
        alterarSituacao,
        limparMensagem: () => setMensagem("")
    };
}

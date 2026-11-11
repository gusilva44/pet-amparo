import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Aside from "../components/aside/aside";
import CabecalhoVeterinario from "../components/veterinario/cabecalhoVeterinario";
import AgendamentosVeterinario from "../components/veterinario/agendamentos";
import AgendaVeterinario from "../components/veterinario/agenda";
import DisponibilidadeVeterinario from "../components/veterinario/disponibilidade";
import useAgendamentosVeterinario from "../components/veterinario/useAgendamentosVeterinario";
import usePerfilVeterinario from "../components/veterinario/usePerfilVeterinario";
import "../scss/pagVeterinario.scss";

export default function Veterinario() {
    const [searchParams] = useSearchParams();
    const abaAtiva = ["agenda", "disponibilidade"].includes(searchParams.get("aba"))
        ? searchParams.get("aba")
        : "atendimentos";
    const nome = usePerfilVeterinario();

    const {
        agendamentos,
        carregando,
        mensagem,
        atualizandoId,
        recarregar,
        alterarSituacao,
        limparMensagem
    } = useAgendamentosVeterinario();

    const totais = useMemo(() => ({
        total: agendamentos.length,
        pendentes: agendamentos.filter((item) => item.situacao === "pendente").length
    }), [agendamentos]);

    return (
        <div className="pagina-veterinario">
            <Aside />

            <main className="conteudo-veterinario">
                <CabecalhoVeterinario
                    nome={nome}
                    pendentes={totais.pendentes}
                    total={totais.total}
                />

                {abaAtiva === "atendimentos" ? (
                    <AgendamentosVeterinario
                        agendamentos={agendamentos}
                        carregando={carregando}
                        mensagem={mensagem}
                        atualizandoId={atualizandoId}
                        alterarSituacao={alterarSituacao}
                        recarregar={recarregar}
                        limparMensagem={limparMensagem}
                    />
                ) : abaAtiva === "agenda" ? (
                    <AgendaVeterinario
                        agendamentos={agendamentos}
                        carregando={carregando}
                        atualizandoId={atualizandoId}
                        alterarSituacao={alterarSituacao}
                    />
                ) : (
                    <DisponibilidadeVeterinario />
                )}
            </main>
        </div>
    );
}

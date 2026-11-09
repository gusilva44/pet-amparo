import { useMemo, useState } from "react";
import Aside from "../components/aside/aside";
import CabecalhoVeterinario from "../components/veterinario/cabecalhoVeterinario";
import AgendamentosVeterinario from "../components/veterinario/agendamentos";
import AgendaVeterinario from "../components/veterinario/agenda";
import DisponibilidadeVeterinario from "../components/veterinario/disponibilidade";
import useAgendamentosVeterinario from "../components/veterinario/useAgendamentosVeterinario";
import usePerfilVeterinario from "../components/veterinario/usePerfilVeterinario";
import "../scss/pagVeterinario.scss";

const ABAS = [
    {
        id: "atendimentos",
        rotulo: "Atendimentos",
        icone: "fa-solid fa-clipboard-list"
    },
    {
        id: "agenda",
        rotulo: "Agenda do mês",
        icone: "fa-regular fa-calendar-days"
    },
    {
        id: "disponibilidade",
        rotulo: "Minha disponibilidade",
        icone: "fa-regular fa-clock"
    }
];

export default function Veterinario() {
    const [abaAtiva, setAbaAtiva] = useState("atendimentos");
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

                <nav className="abas-veterinario" aria-label="Seções do painel">
                    {ABAS.map((aba) => (
                        <button
                            type="button"
                            key={aba.id}
                            className={`aba ${abaAtiva === aba.id ? "ativa" : ""}`}
                            aria-current={abaAtiva === aba.id ? "page" : undefined}
                            onClick={() => setAbaAtiva(aba.id)}
                        >
                            <i className={aba.icone}></i>
                            {aba.rotulo}
                        </button>
                    ))}
                </nav>

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

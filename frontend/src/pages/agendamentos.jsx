import { useState } from 'react';
import '../scss/agendamentos.scss';
import Aside from '../components/aside/aside';
import Calendario from '../components/calendario/calendario.jsx';
import AgendamentosMes from '../components/agendamentos/agendamentos.jsx';

import Logo from '../assets/imagens/Logo.webp';
import Cachorro from '../assets/imagens/cachorro-agendamentos.png';

const dadosExemplo = [
    {
        id: 1,
        pet: 'Thor',
        tipo: 'Consulta',
        tipoCor: 'consulta',
        data: '2026-10-14',
        horario: '14:00',
        unidade: 'Unidade veterinária',
        endereco: 'Centro',
        status: 'Confirmado'
    },
    {
        id: 2,
        pet: 'Mel',
        tipo: 'Vacinação',
        tipoCor: 'vacinacao',
        data: '2026-10-23',
        horario: '09:30',
        unidade: 'Unidade veterinária',
        endereco: 'Centro',
        status: 'Confirmado'
    },
    {
        id: 3,
        pet: 'Luna',
        tipo: 'Retorno',
        tipoCor: 'retorno',
        data: '2026-10-26',
        horario: '10:00',
        unidade: 'Unidade veterinária',
        endereco: 'Zona Norte',
        status: 'Pendente'
    },
    {
        id: 4,
        pet: 'Bob',
        tipo: 'Consulta',
        tipoCor: 'consulta',
        data: '2026-10-02',
        horario: '08:30',
        unidade: 'Unidade veterinária',
        endereco: 'Centro',
        status: 'Confirmado'
    }
];

export default function Agendamentos() {
    const [mesAtual, setMesAtual] = useState(new Date());
    const [agendamentoSelecionado, setAgendamentoSelecionado] =
        useState(null);

    function mudarMes(direcao) {
        setMesAtual(mes => new Date(
            mes.getFullYear(),
            mes.getMonth() + direcao,
            1
        ));

        setAgendamentoSelecionado(null);
    }

    return (
        <div className="page-Agendamentos">
            <Aside />

            <main className="main">
                <div className="logo">
                    <img src={Logo} alt="PetAmparo" />
                </div>

                <div className="banner">
                    <section className="icon">
                        <i className="fa-regular fa-calendar" />
                    </section>

                    <section className="texto-banner">
                        <h2>Agendamento</h2>

                        <p>
                            Aqui você pode visualizar seus
                            agendamentos e marcar um novo
                            atendimento para o seu pet.
                        </p>
                    </section>

                    <section className="imagem-banner">
                        <img
                            src={Cachorro}
                            alt="Cachorro"
                        />
                    </section>
                </div>

                <div className="conteudo-agendamentos">
                    <Calendario
                        mesAtual={mesAtual}
                        agendamentos={dadosExemplo}
                        agendamentoSelecionado={agendamentoSelecionado}
                        onSelecionar={setAgendamentoSelecionado}
                        onMudarMes={mudarMes}
                    />

                    <div className="legenda-agendamentos">
                        <h3>
                            Legenda de cores para cada tipo de atendimento
                        </h3>

                        <div className="itens-legenda">
                            <span>
                                <i className="cor consulta" />
                                Consulta
                            </span>

                            <span>
                                <i className="cor vacinacao" />
                                Vacinação
                            </span>

                            <span>
                                <i className="cor retorno" />
                                Retorno
                            </span>
                        </div>
                    </div>

                    <AgendamentosMes
                        agendamentos={dadosExemplo}
                        mesAtual={mesAtual}
                    />

                    <section className="novo-agendamento">
                        <h3>Ainda não tem um agendamento?</h3>

                        <p>
                            Cuide da saúde do seu melhor amigo!
                        </p>

                        <button>
                           <a href='#unidades'>Clique aqui para agendar seu atendimento</a> 
                        </button>
                    </section>
                </div>
            </main>
        </div>
    );
}


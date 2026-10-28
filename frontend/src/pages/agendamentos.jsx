
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import '../scss/agendamentos.scss';
import Aside from '../components/aside/aside';
import Calendario from '../components/calendario/calendario.jsx';
import AgendamentosMes from '../components/agendamentos/agendamentos.jsx';

import Logo from '../assets/imagens/Logo.webp';
import Cachorro from '../assets/imagens/cachorro-agendamentos.png';

import { authApi } from '../services/api';
import Auth from '../auth/auth';

export default function Agendamentos() {
    const [searchParams] = useSearchParams();

    const modoAuth =
        searchParams.get('modo') === 'cadastro' ? 'cadastro' : 'login';

    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    const [mesAtual, setMesAtual] = useState(new Date());
    const [agendamentoSelecionado, setAgendamentoSelecionado] =
        useState(null);

    const [agendamentos, setAgendamentos] = useState([]);

    // Carrega os dados do usuário.
    const carregarDados = useCallback(async (dadosUsuario) => {
        setUsuario(dadosUsuario);

        // A busca dos agendamentos reais será conectada à API aqui.
        setAgendamentos([]);
    }, []);

    // Verifica se existe uma sessão salva.
    useEffect(() => {
        let ativo = true;

        async function verificarSessao() {
            try {
                const resposta = await authApi.usuarioAtual();

                if (ativo) {
                    await carregarDados(resposta.usuario);
                }
            } catch {
                if (ativo) {
                    setUsuario(null);
                    setAgendamentos([]);
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        verificarSessao();

        return () => {
            ativo = false;
        };
    }, [carregarDados]);

    // Executada quando o login ou cadastro é concluído.
    async function autenticar(dadosUsuario) {
        setCarregando(true);

        try {
            await carregarDados(dadosUsuario);
        } finally {
            setCarregando(false);
        }
    }

    // Muda o mês do calendário.
    function mudarMes(direcao) {
        setMesAtual(mes => new Date(
            mes.getFullYear(),
            mes.getMonth() + direcao,
            1
        ));

        setAgendamentoSelecionado(null);
    }

    if (carregando) {
        return (
            <div className="page-Agendamentos">
                <Aside />

                <main className="main">
                    <p>Carregando...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="page-Agendamentos">
            <Aside />

            <main className="main">
                <div className="logo">
                    <img src={Logo} alt="PetAmparo" />
                </div>

                {!usuario ? (
                    <Auth
                        key={modoAuth}
                        initialMode={modoAuth}
                        onAuthenticated={autenticar}
                    />
                ) : (
                    <>
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
                                agendamentos={agendamentos}
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
                                agendamentos={agendamentos}
                                mesAtual={mesAtual}
                            />

                            <section className="novo-agendamento">
                                <h3>Ainda não tem um agendamento?</h3>

                                <p>
                                    Cuide da saúde do seu melhor amigo!
                                </p>

                                <button
                                className='n'
                                    onClick={() => {
                                        window.location.href = '/unidades';
                                    }}
                                >
                                    Clique aqui para agendar seu atendimento
                                </button>
                            </section>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

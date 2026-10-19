
import './calendario.scss';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatarData(ano, mes, dia) {
    return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

export default function Calendario({
    mesAtual,
    agendamentos,
    agendamentoSelecionado,
    onSelecionar,
    onMudarMes
}) {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    const dias = [];

    for (let i = 0; i < primeiroDia; i++) {
        dias.push(null);
    }

    for (let dia = 1; dia <= totalDias; dia++) {
        dias.push(dia);
    }

    while (dias.length < 42) {
        dias.push(null);
    }

    const nomeMes = mesAtual.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <section className="calendario">

            <div className="calendario-cabecalho">
                <button
                    type="button"
                    onClick={() => onMudarMes(-1)}
                    aria-label="Mês anterior"
                >
                    ‹
                </button>
                <button
                    type="button"
                    onClick={() => onMudarMes(1)}
                    aria-label="Próximo mês"
                >
                    ›
                </button>
                <h2>
                    {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}
                </h2>

               
            </div>

            <div className="calendario-grade">
                {diasSemana.map(dia => (
                    <div className="dia-semana" key={dia}>
                        {dia}
                    </div>
                ))}

                {dias.map((dia, indice) => {
                    if (dia === null) {
                        return (
                            <div
                                className="dia-vazio"
                                key={`vazio-${indice}`}
                            />
                        );
                    }

                    const data = formatarData(ano, mes, dia);

                    const consultas = agendamentos.filter(
                        item => item.data === data
                    );

                    return (
                        <div
                            className={`dia-calendario ${
                                agendamentoSelecionado?.data === data
                                    ? 'dia-destacado'
                                    : ''
                            }`}
                            key={data}
                        >
                            <span className="numero-dia">{dia}</span>

                            <div className="eventos-dia">
                                {consultas.slice(0, 2).map(item => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        className={`evento evento-${item.tipoCor} ${
                                            agendamentoSelecionado?.id === item.id
                                                ? 'evento-selecionado'
                                                : ''
                                        }`}
                                        onClick={() => onSelecionar(item)}
                                        title={`${item.pet} - ${item.horario}`}
                                    >
                                        <span>{item.horario}</span>
                                        <span>{item.pet}</span>
                                    </button>
                                ))}

                                {consultas.length > 2 && (
                                    <span className="mais-eventos">
                                        +{consultas.length - 2}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}


import './agendamentos.scss';

export default function AgendamentosMes({
    agendamentos,
    mesAtual
}) {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();

    const agendamentosDoMes = agendamentos
        .filter(item => {
            const [anoItem, mesItem] = item.data.split('-').map(Number);

            return anoItem === ano && mesItem === mes + 1;
        })
        .sort((a, b) => {
            return a.data.localeCompare(b.data) ||
                a.horario.localeCompare(b.horario);
        });

    function formatarData(data) {
        const [ano, mes, dia] = data.split('-').map(Number);

        return new Date(ano, mes - 1, dia).toLocaleDateString(
            'pt-BR',
            {
                day: '2-digit',
                month: 'short',
                weekday: 'long'
            }
        ).replace('.', '');
    }

    return (
        <section className="agendamentos-mes">
            <h2>Mais informações sobre os agendamentos</h2>

            {agendamentosDoMes.length === 0 ? (
                <p className="sem-agendamentos">
                    Você ainda não tem agendamentos neste mês.
                </p>
            ) : (
                <div className="lista-agendamentos">
                    {agendamentosDoMes.map(item => (
                        <article
                            className="cartao-agendamento"
                            key={item.id}
                        >
                            <div className="data-agendamento">
                                <span>
    {new Date(
        ...item.data.split('-').map(Number).map((valor, indice) =>
            indice === 1 ? valor - 1 : valor
        )
    ).toLocaleDateString('pt-BR', { month: 'short' })}
</span>
                                <strong>
                                    {item.data.split('-')[2]}
                                </strong>

                                <span>
                                    {formatarData(item.data).split(' ')[1]}
                                </span>

                                <small>
                                    {formatarData(item.data).split(',')[0]}
                                </small>
                            </div>

                            <div className="dados-agendamento">
                                <strong>{item.pet}</strong>
                                <span>{item.tipo}</span>
                                <span>{item.unidade}</span>
                                <span>{item.endereco}</span>
                                <span>{item.horario}</span>
                            </div>

                            <span
                                className={`status-agendamento status-${item.status.toLowerCase()}`}
                            >
                                {item.status}
                            </span>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

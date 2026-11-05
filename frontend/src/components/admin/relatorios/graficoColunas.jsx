export default function GraficoColunas({ dados, corDestaque }) {
    const maiorValor = Math.max(...dados.map((item) => Number(item.total) || 0), 1);

    return (
        <div className="grafico-colunas">
            {dados.map((item) => {
                const total = Number(item.total) || 0;
                const altura = Math.round((total / maiorValor) * 100);
                const concluidos = Number(item.concluidos) || 0;
                const alturaConcluidos =
                    total > 0 ? Math.round((concluidos / total) * altura) : 0;

                return (
                    <div className="coluna" key={item.mes || item.rotulo}>
                        <div className="area-barra">
                            <span className="valor" style={{ color: corDestaque }}>
                                {total}
                            </span>

                            <div
                                className="barra"
                                style={{ height: `${Math.max(altura, 3)}%` }}
                                title={`${item.rotulo}: ${total} agendamentos`}
                            >
                                {alturaConcluidos > 0 && (
                                    <span
                                        className="barra-concluida"
                                        style={{ height: `${(alturaConcluidos / Math.max(altura, 3)) * 100}%` }}
                                    />
                                )}
                            </div>
                        </div>

                        <small>{item.rotulo}</small>
                    </div>
                );
            })}
        </div>
    );
}

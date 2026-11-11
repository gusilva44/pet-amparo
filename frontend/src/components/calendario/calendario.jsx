import "./calendario.scss";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\u00e1b"];

function formatarData(ano, mes, dia) {
return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export default function Calendario({
mesAtual,
agendamentos,
agendamentoSelecionado,
onSelecionar,
onSelecionarData,
dataMinima,
  diasDisponiveis,
  datasDisponiveis,
onMudarMes,
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

const nomeMes = mesAtual.toLocaleDateString("pt-BR", {
  month: "long",
  year: "numeric",
});

return (
  <section className="calendario">
    <div className="calendario-cabecalho">
      <button
        type="button"
        onClick={() => onMudarMes(-1)}
        aria-label="Previous month"
      >
        {"<"}
      </button>
      <button
        type="button"
        onClick={() => onMudarMes(1)}
        aria-label="Next month"
      >
        {">"}
      </button>
      <h2>{nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</h2>
    </div>

    <div className="calendario-grade">
      {diasSemana.map((dia) => (
        <div className="dia-semana" key={dia}>
          {dia}
        </div>
      ))}

      {dias.map((dia, indice) => {
        if (dia === null) {
          return <div className="dia-vazio" key={`vazio-${indice}`} />;
        }

        const data = formatarData(ano, mes, dia);

        const consultas = agendamentos.filter((item) => item.data === data);
        const passada = Boolean(dataMinima && data < dataMinima);
        const diaSemana = new Date(`${data}T12:00:00`).getDay() || 7;
        const indisponivel = Boolean(
          (datasDisponiveis && !datasDisponiveis.includes(data) && !diasDisponiveis?.includes(diaSemana)) ||
          (!datasDisponiveis && diasDisponiveis && !diasDisponiveis.includes(diaSemana))
        );
        const desabilitado = passada || indisponivel;

        return (
          <div
            key={data}
            className={`dia-calendario ${
              agendamentoSelecionado?.data === data ? "dia-destacado" : ""
            } ${indisponivel ? "dia-indisponivel" : ""}`}
            role={onSelecionarData && !desabilitado ? "button" : undefined}
            tabIndex={onSelecionarData && !desabilitado ? 0 : undefined}
            aria-disabled={Boolean(desabilitado)}
            onClick={() => {
              if (!desabilitado) onSelecionarData?.(data);
            }}
            onKeyDown={(event) => {
              if (
                !desabilitado &&
                onSelecionarData &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                onSelecionarData(data);
              }
            }}
          >
            <span className="numero-dia">{dia}</span>

            <div className="eventos-dia">
              {consultas.slice(0, 2).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`evento evento-${item.tipoCor} ${
                    agendamentoSelecionado?.id === item.id
                      ? "evento-selecionado"
                      : ""
                  } evento-status-${item.situacao || "pendente"}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelecionar(item);
                    onSelecionarData?.(data);
                  }}
                  title={`${item.pet} - ${item.horario} - ${item.status || "Pendente"}`}
                >
                  <span>{item.horario}</span>
                  <span>{item.pet}</span>
                  <span className="status-evento">{item.status || "Pendente"}</span>
                </button>
              ))}

              {consultas.length > 2 && (
                <span className="mais-eventos">+{consultas.length - 2}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </section>
);
}

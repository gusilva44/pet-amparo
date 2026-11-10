export const FUSO_HORARIO = "America/Sao_Paulo";

const DATA_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATA_HORA_LOCAL_RE = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

function duasCasas(valor) {
  return String(valor).padStart(2, "0");
}

function partesNoFuso(data) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: FUSO_HORARIO,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(data)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );
}

export function normalizarData(valor) {
  if (typeof valor !== "string") throw new Error("Informe uma data válida.");
  const partes = valor.match(DATA_RE);
  if (!partes) throw new Error("Informe uma data válida.");
  const [, anoTexto, mesTexto, diaTexto] = partes;
  const ano = Number(anoTexto);
  const mes = Number(mesTexto);
  const dia = Number(diaTexto);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) {
    throw new Error("Informe uma data válida.");
  }
  return valor;
}

export function dataHoraParaBanco(data, hora, minuto = "00", segundo = "00") {
  return `${normalizarData(data)} ${hora}:${minuto}:${segundo}`;
}

export function normalizarDataHora(valor) {
  if (typeof valor !== "string" || !valor.trim()) throw new Error("A data e hora de início são obrigatórias.");
  const local = valor.trim().match(DATA_HORA_LOCAL_RE);
  if (local) {
    const [, data, hora, minuto, segundo = "00"] = local;
    normalizarData(data);
    if (segundo !== "00") throw new Error("O horário deve ser informado em minutos inteiros.");
    return dataHoraParaBanco(data, hora, minuto, segundo);
  }

  if (!/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/i.test(valor.trim())) {
    throw new Error("Informe a data e hora com fuso horário ou no horário local da unidade.");
  }
  const instante = new Date(valor);
  if (Number.isNaN(instante.getTime())) throw new Error("Data e hora de início inválidas.");
  const partes = partesNoFuso(instante);
  if (partes.second !== "00") throw new Error("O horário deve ser informado em minutos inteiros.");
  return dataHoraParaBanco(partes.year + "-" + partes.month + "-" + partes.day, partes.hour, partes.minute, partes.second);
}

export function dataDeDataHora(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(valor)) throw new Error("Data e hora inválidas.");
  return valor.slice(0, 10);
}

export function minutosDaHora(valor) {
  const partes = String(valor).match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (!partes || Number(partes[1]) > 23 || Number(partes[2]) > 59) throw new Error("Horário inválido.");
  return Number(partes[1]) * 60 + Number(partes[2]);
}

export function diaSemana(data) {
  const dia = new Date(`${normalizarData(data)}T12:00:00Z`).getUTCDay();
  return dia === 0 ? 7 : dia;
}

export function adicionarMinutos(dataHora, minutos) {
  const data = dataDeDataHora(dataHora);
  const [hora, minuto, segundo] = dataHora.slice(11).split(":").map(Number);
  const [ano, mes, dia] = data.split("-").map(Number);
  const valor = new Date(Date.UTC(ano, mes - 1, dia, hora, minuto + minutos, segundo));
  return `${valor.getUTCFullYear()}-${duasCasas(valor.getUTCMonth() + 1)}-${duasCasas(valor.getUTCDate())} ${duasCasas(valor.getUTCHours())}:${duasCasas(valor.getUTCMinutes())}:${duasCasas(valor.getUTCSeconds())}`;
}

export function agoraNoFuso() {
  const partes = partesNoFuso(new Date());
  return dataHoraParaBanco(`${partes.year}-${partes.month}-${partes.day}`, partes.hour, partes.minute, partes.second);
}

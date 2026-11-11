const MESES_LONGOS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const MESES_CURTOS = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez"
];

const DIAS_SEMANA = [
    "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
];

export function paraData(valor) {
    if (!valor) return null;

    if (valor instanceof Date) {
        return Number.isNaN(valor.getTime()) ? null : valor;
    }

    const texto = String(valor);
    const somenteData = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const data = somenteData
        ? new Date(Number(somenteData[1]), Number(somenteData[2]) - 1, Number(somenteData[3]), 12)
        : new Date(texto);

    return Number.isNaN(data.getTime()) ? null : data;
}

export function duasCasas(valor) {
    return String(valor).padStart(2, "0");
}

export function chaveDoDia(valor) {
    const data = paraData(valor);
    if (!data) return "";

    return `${data.getFullYear()}-${duasCasas(data.getMonth() + 1)}-${duasCasas(data.getDate())}`;
}

export function chaveDoMes(valor) {
    const data = paraData(valor);
    if (!data) return "";

    return `${data.getFullYear()}-${duasCasas(data.getMonth() + 1)}`;
}

export function mesAtual() {
    return chaveDoMes(new Date());
}

export function formatarHora(valor) {
    const data = paraData(valor);
    if (!data) return "--:--";

    return `${duasCasas(data.getHours())}:${duasCasas(data.getMinutes())}`;
}

export function formatarDataCurta(valor) {
    const data = paraData(valor);
    if (!data) return "—";

    return `${duasCasas(data.getDate())} ${MESES_CURTOS[data.getMonth()]}`;
}

export function formatarDataCompleta(valor) {
    const data = paraData(valor);
    if (!data) return "—";

    return `${duasCasas(data.getDate())} de ${MESES_LONGOS[data.getMonth()]} de ${data.getFullYear()}`;
}

export function rotuloDoMes(chave) {
    if (typeof chave !== "string" || chave.length < 7) return "";

    const [ano, mes] = chave.split("-");

    return `${MESES_LONGOS[Number(mes) - 1]} de ${ano}`;
}

export function rotuloDoDia(valor) {
    const data = paraData(valor);
    if (!data) return "";

    return `${DIAS_SEMANA[data.getDay()]}, ${duasCasas(data.getDate())} de ${MESES_LONGOS[data.getMonth()]}`;
}

export function somarMeses(chave, quantidade) {
    const data = paraData(`${chave}-01T00:00:00`);
    if (!data) return chave;

    data.setMonth(data.getMonth() + quantidade);

    return chaveDoMes(data);
}

export function diasDoMes(chave) {
    const inicio = paraData(`${chave}-01T00:00:00`);
    if (!inicio) return [];

    const total = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0).getDate();
    const dias = [];

    for (let dia = 1; dia <= total; dia += 1) {
        const data = new Date(inicio.getFullYear(), inicio.getMonth(), dia);

        dias.push({
            dia,
            chave: chaveDoDia(data),
            diaSemana: data.getDay(),
            passado: data < new Date(new Date().setHours(0, 0, 0, 0))
        });
    }

    return dias;
}

export function primeiroDiaSemana(chave) {
    const data = paraData(`${chave}-01T00:00:00`);
    if (!data) return 0;

    return data.getDay();
}

export function ehHoje(valor) {
    return chaveDoDia(valor) === chaveDoDia(new Date());
}

export { MESES_LONGOS, MESES_CURTOS, DIAS_SEMANA };

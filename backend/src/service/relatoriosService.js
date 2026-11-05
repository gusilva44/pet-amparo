import * as repo from "../repos/relatoriosRepo.js";

const PERIODOS_PERMITIDOS = [1, 3, 6, 12];
const PERIODO_PADRAO = 6;
const LIMITE_PROXIMOS = 8;
const LIMITE_MEDICAMENTOS = 5;

const NOMES_MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function normalizarPeriodo(valor) {
  const meses = Number(valor);

  if (!PERIODOS_PERMITIDOS.includes(meses)) return PERIODO_PADRAO;
  return meses;
}

function numero(valor) {
  return Number(valor) || 0;
}

function chaveDoMes(data) {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${data.getFullYear()}-${mes}`;
}

function rotuloDoMes(chave) {
  const [ano, mes] = chave.split("-");
  return `${NOMES_MESES[Number(mes) - 1]}/${ano.slice(2)}`;
}

function serieMensal(meses, registros) {
  const mapa = new Map(registros.map((item) => [item.mes, item]));
  const hoje = new Date();
  const serie = [];

  for (let indice = meses - 1; indice >= 0; indice -= 1) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - indice, 1);
    const chave = chaveDoMes(data);
    const registro = mapa.get(chave);

    serie.push({
      mes: chave,
      rotulo: rotuloDoMes(chave),
      total: numero(registro?.total),
      concluidos: numero(registro?.concluidos),
      cancelados: numero(registro?.cancelados),
    });
  }

  return serie;
}

function resumirStatus(registros) {
  const totais = {
    agendado: 0,
    confirmado: 0,
    em_atendimento: 0,
    concluido: 0,
    cancelado: 0,
  };

  registros.forEach((registro) => {
    if (registro.status in totais) {
      totais[registro.status] = numero(registro.total);
    }
  });

  const total = Object.values(totais).reduce((soma, valor) => soma + valor, 0);
  const pendentes =
    totais.agendado + totais.confirmado + totais.em_atendimento;

  return {
    total,
    pendentes,
    concluidos: totais.concluido,
    cancelados: totais.cancelado,
    taxaConclusao: total > 0 ? Math.round((totais.concluido / total) * 100) : 0,
    taxaCancelamento:
      total > 0 ? Math.round((totais.cancelado / total) * 100) : 0,
  };
}

export async function gerarRelatorio(periodo) {
  const meses = normalizarPeriodo(periodo);

  const [
    unidades,
    usuarios,
    animais,
    servicos,
    status,
    porUnidade,
    porServico,
    porVeterinario,
    porMes,
    proximos,
    medicamentos,
  ] = await Promise.all([
    repo.contarUnidades(),
    repo.contarUsuariosPorTipo(),
    repo.contarAnimais(),
    repo.contarServicos(),
    repo.contarAgendamentosPorStatus(meses),
    repo.agendamentosPorUnidade(meses),
    repo.agendamentosPorServico(meses),
    repo.agendamentosPorVeterinario(meses),
    repo.agendamentosPorMes(meses),
    repo.proximosAgendamentos(LIMITE_PROXIMOS),
    repo.medicamentosMaisPrescritos(LIMITE_MEDICAMENTOS),
  ]);

  const porTipo = usuarios.reduce((acumulado, registro) => {
    acumulado[registro.tipo] = numero(registro.total);
    return acumulado;
  }, {});

  const totalAnimais = numero(animais?.total);
  const animaisVacinados = numero(animais?.vacinados);

  return {
    periodo: meses,
    geradoEm: new Date().toISOString(),
    resumo: {
      unidades: numero(unidades?.total),
      unidadesAtivas: numero(unidades?.ativas),
      clientes: numero(porTipo.cliente),
      veterinarios: numero(porTipo.veterinario),
      administradores: numero(porTipo.admin),
      animais: totalAnimais,
      servicos: numero(servicos?.total),
      servicosAtivos: numero(servicos?.ativos),
    },
    animais: {
      total: totalAnimais,
      vacinados: animaisVacinados,
      naoVacinados: Math.max(totalAnimais - animaisVacinados, 0),
      coberturaVacinacao:
        totalAnimais > 0
          ? Math.round((animaisVacinados / totalAnimais) * 100)
          : 0,
    },
    agendamentos: resumirStatus(status),
    porUnidade: porUnidade.map((registro) => ({
      id: registro.id_unidade,
      nome: registro.nome,
      total: numero(registro.total),
      concluidos: numero(registro.concluidos),
      cancelados: numero(registro.cancelados),
    })),
    porServico: porServico.map((registro) => ({
      id: registro.id_servico,
      nome: registro.nome,
      total: numero(registro.total),
    })),
    porVeterinario: porVeterinario.map((registro) => ({
      id: registro.id_veterinario,
      nome: registro.nome,
      especialidade: registro.especialidade,
      total: numero(registro.total),
      concluidos: numero(registro.concluidos),
    })),
    porMes: serieMensal(meses, porMes),
    proximos: proximos.map((registro) => ({
      id: registro.id_agendamento,
      inicio: registro.inicio,
      status: registro.status,
      cliente: registro.cliente,
      animal: registro.animal,
      servico: registro.servico,
      unidade: registro.unidade,
      veterinario: registro.veterinario,
    })),
    medicamentos: medicamentos.map((registro) => ({
      id: registro.id_medicamento,
      nome: registro.nome,
      total: numero(registro.total),
    })),
  };
}

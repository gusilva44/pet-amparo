export function somenteNumeros(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

export function limparEspacos(valor) {
  return String(valor ?? "").replace(/\s+/g, " ").trim();
}

export function formatarCPF(valor) {
  return somenteNumeros(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function validarCPF(valor) {
  const numeros = somenteNumeros(valor);

  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) return false;

  const calcularDigito = (quantidade, pesoInicial) => {
    const soma = numeros
      .slice(0, quantidade)
      .split("")
      .reduce((total, digito, indice) => total + Number(digito) * (pesoInicial - indice), 0);
    const resultado = (soma * 10) % 11;
    return resultado === 10 ? 0 : resultado;
  };

  return calcularDigito(9, 10) === Number(numeros[9])
    && calcularDigito(10, 11) === Number(numeros[10]);
}

export function formatarTelefone(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (numeros.length <= 2) return numeros ? `(${numeros}` : "";

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d{0,4})(\d{0,4})$/, "($1) $2-$3")
      .replace(/-$/, "");
  }

  return numeros
    .replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3")
    .replace(/-$/, "");
}

export function formatarCEP(valor) {
  return somenteNumeros(valor)
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2");
}

export function formatarDataDigitada(valor) {
  const numeros = somenteNumeros(valor).slice(0, 8);

  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

export function dataBRParaISO(valor) {
  const encontrada = String(valor ?? "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!encontrada) return "";

  const [, dia, mes, ano] = encontrada;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia), 12);
  const valida = data.getFullYear() === Number(ano)
    && data.getMonth() === Number(mes) - 1
    && data.getDate() === Number(dia);

  return valida ? `${ano}-${mes}-${dia}` : "";
}

export function isoParaDataBR(valor) {
  const encontrada = String(valor ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return encontrada ? `${encontrada[3]}/${encontrada[2]}/${encontrada[1]}` : "";
}

export function hojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function normalizarEmail(valor) {
  return String(valor ?? "").trim().toLowerCase();
}

export function normalizarTexto(valor) {
  return limparEspacos(valor);
}

// Avisa componentes compartilhados quando o estado da sessao muda.
export function avisarMudancaAutenticacao() {
  window.dispatchEvent(new Event("auth:changed"));
}
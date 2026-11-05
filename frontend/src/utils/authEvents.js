export function avisarMudancaAutenticacao() {
  window.dispatchEvent(new Event("auth:changed"));
}

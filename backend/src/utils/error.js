import horaAtual from "./date";

export function logError(error){
    console.log(`---> ERRO ${horaAtual()} --- ${error}`)
}

export function formatarError(error){
    return {
        sucesso: false,
        mensagem: error.message || 'Ocorreu um erro interno no servidor.'
    };
}
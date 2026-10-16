import axios from 'axios'

// A URL pode ser sobrescrita em `.env` com REACT_APP_API_URL.
// O backend local roda na porta 3001; o frontend roda na porta 3000.
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json'
    },
    // A sessão do backend fica em um cookie HTTP-only chamado `token`.
    // O navegador envia e recebe esse cookie automaticamente; não guardar token no localStorage.
    withCredentials: true
})

// Retorna somente o corpo da resposta para simplificar o uso nos componentes.
// O erro do Axios continua disponível no catch, incluindo `error.response.status` e `error.response.data`.
export async function requisicao(config) {
    const resposta = await api.request(config)
    return resposta.data
}

// Extrai a mensagem de erro que o backend retorna no formato { mensagem } ou { sucesso, mensagem }.
export function mensagemErroApi(error) {
    return error.response?.data?.mensagem
        || error.response?.data?.message
        || error.message
        || 'Não foi possível concluir a comunicação com a API.'
}

export default api

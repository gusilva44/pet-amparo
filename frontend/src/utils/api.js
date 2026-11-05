import axios from 'axios'

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
})

export async function requisicao(config) {
    const resposta = await api.request(config)
    return resposta.data
}

export function mensagemErroApi(error) {
    return error.response?.data?.mensagem
        || error.response?.data?.message
        || error.message
        || 'Não foi possível concluir a comunicação com a API.'
}

export default api

import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from '../assets/imagens/Logo.webp'
import { unidadesApi } from '../services/api';

export default function Unidades(){
    const { id } = useParams()
    const [unidade, setUnidade] = useState(null) // Mantém null para indicar "carregando"

    useEffect(() => {
        async function carregarUnidade() {
            try {
                const resultado = await unidadesApi.buscarPorId(id)
                setUnidade(resultado) // Salva o objeto retornado
            } catch (error) {
                console.error('Erro ao buscar unidade:', error)
            }
        }

        carregarUnidade()
    }, [id])

    // Mensagem de carregamento enquanto o estado for null
    if (!unidade) {
        return <p>Carregando unidade...</p>
    }

    // Renderiza direto as propriedades do objeto, sem usar .map
    return(
        <ul>
            <li key={unidade.id_unidade}>{unidade.nome}</li>
        </ul>
    )
}
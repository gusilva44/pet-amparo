import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Aside from '../components/aside/aside';
import axios from 'axios'
import logo from '../assets/imagens/Logo.webp'
import '../scss/unidades.scss'

export default function Unidades(){
    const { id } = useParams()
    const [unidade, setUnidade] = useState(null) // Mantém null para indicar "carregando"

    useEffect(() => {
        async function carregarUnidade() {
            try {
                let url = `http://localhost:3000/unidades/${id}`

                const resultado = await axios.get(url)
                const dados = (resultado.data).resultado
                setUnidade(dados)
            } catch (error) {
                console.error('Erro ao buscar unidade:', error)
            }
        }

        carregarUnidade()
    }, [id])
    if (!unidade) {
        return <p>Carregando unidade...</p>
    }

    return(
        <div className="main">
            <Aside />
            <div className="content">
                <img src={logo} alt="Nossa logo"/>

                <div className="unidade">
                    <div className="info">
                        <div className="img">

                        </div>
                        <div className="texto">
                            <h1>{dados.nome}</h1>
                            <div className="horarios">
                                <label htmlFor="">
                                    <img src="" alt="icone" />
                                    <h2>Horário de Funcionamento</h2>
                                </label>
                                <label htmlFor="">
                                    <p>Segunda a sexta</p>
                                    <p>xx ate as xx</p>
                                </label>
                                <label htmlFor="">
                                    <p>Fins de semana</p>
                                    <p>xx ate as xx</p>
                                </label>
                                <label htmlFor="">
                                    <img src="" alt="icone" />
                                    <h2>Localização</h2>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
import { useParams } from 'react-router-dom';
import Logo from '../assets/imagens/Logo.webp'

export default function Unidades(){
    const { id } = useParams()

    return(
        <div className="unidades-page">
            <header>
                <img src={Logo} alt="Logo do Pet-Amparo" />
                {id}
            </header>
        </div>  
    )
}
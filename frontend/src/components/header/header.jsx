import './header.scss'
import Logo from '../../assets/imagens/Logo.webp'
import Casa from '../../assets/imagens/icones/icone-casa.png'
import Localizacao from '../../assets/imagens/icones/icone-localizacao.png'
import Sobre from '../../assets/imagens/icones/sobre-icone.png'
import { Link } from 'react-router-dom'

export default function Header(){
    return(
        <header className='comps-header'>
            <section className="logo">
                <img className='comps-logo' src={Logo} alt="Logo Pet Amparo" />
            </section>
            <section>
                <ul>
                    <li>
                        <Link className='nav' to='#' > <img className='icone-header' src={Casa} alt="Icone casa" /> Início</Link>
                    </li>
                    <li>
                        <Link className='nav' to='#' > <img className='icone-header' src={Localizacao} alt="Icone localização" /> Unidades</Link>
                    </li>
                    <li>
                        <Link className='nav' to='#' > <img className='icone-header' src={Sobre} alt="Icone sobre" /> Sobre</Link>
                    </li>
                </ul>
            </section>
        </header>
    )
    
}
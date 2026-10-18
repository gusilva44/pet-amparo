import './header.scss'
import Logo from '../../assets/imagens/Logo.webp'
import Casa from '../../assets/imagens/icones/icone-casa.png'
import Localizacao from '../../assets/imagens/icones/icone-localizacao.png'
import Sobre from '../../assets/imagens/icones/icone-sobre.png'
import { Link } from 'react-router-dom'

export default function Header(){
    return(
        <header className='comps-header'>
            <section className="logo">
                <img className='comps-logo' src={Logo} alt="Logo Pet Amparo" />
            </section>
            <section className='nav'>
                <ul>
                    <li>
                        <a className='links' href='/' > 
                        <img className='icone-header' src={Casa} alt="Icone casa" /> Início</a>
                    </li>
                    <li>
                        
                        <a className="links" href="#unidades">
                        <img className="icone-header" src={Localizacao} alt="Ícone localização"/> Unidades </a>
                    </li>
                    <li>
                        <a className='links' href='#sobre' > 
                        <img className='icone-header' src={Sobre} alt="Icone sobre" /> Sobre</a>
                    </li>
                </ul>
            </section>
        </header>
    )
}
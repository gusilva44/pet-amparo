import './header.scss'
import Logo from '../../assets/imagens/Logo.webp'
import { Link } from 'react-router-dom'

export default function Header(){
    return(
        <header className='comps-header'>
            <section className="logo">
                <img src={Logo} alt="Logo Pet Amparo" />
            </section>
            <section>
                <ul>
                    <li>
                        <Link to='#' >Início</Link>
                    </li>
                    <li>
                        <Link to='#' >Unidades</Link>
                    </li>
                    <li>
                        <Link to='#' >Sobre</Link>
                    </li>
                </ul>
            </section>
        </header>
    )
    
}
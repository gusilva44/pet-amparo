import { Link } from "react-router-dom"
import './aside.scss'
import usuarioLogo from '../../assets/imagens/icones/Perfil.png'

export default function Aside() {
    return (
        <div className="comps-aside">
            <div className="usuario">
                <img className="img-usuario" src={usuarioLogo}   alt="Img usuario" />
                <div className="dados-usuario">
                <h2>Nome S.</h2>
                <p>👋 Seja bem vindo(a)</p>
                </div>
            </div>
            <div className="linha"></div>
            <ul>


                <li>
                    <Link to='/'><i class="fa-regular fa-house"></i> </Link>
                    <Link className="nav"  to='/'> <img className=""/>Início</Link>
                </li>
                <li>
                    <Link to='/meuspets'><i class="fa-solid fa-paw"></i></Link>
                    <Link className="nav" to='/meuspets'> <img className=""/>Meus Pets</Link>
                </li>
                <li>
                    <Link to='#'><i class="fa-regular fa-calendar" ></i></Link> 
                    <Link className="nav"  to='#'> <img className=""/>Agendamentos</Link>
                </li>
                <li>
                    <i class="fa-solid fa-right-from-bracket" ></i>
                    <Link className="nav"  to='#'> <img className=""/>Sair</Link>
                </li>
                
            </ul>
        </div>
    )
}
import { Link } from "react-router-dom"
import './aside.scss'
import usuarioLogo from '../../assets/imagens/usuarioLogo.png'

export default function Aside() {
    return (
        <div className="comps-aside">
            <div className="usuario">
                <img className="img-usuario" src={usuarioLogo}   alt="Img usuario" />
                <div className="dados-usuario">
                <h2>Nome S.</h2>
                <p>Seja bem vindo Nome S.</p>
                </div>
            </div>
            <div className="linha"></div>
            <ul>
                <Link className="nav" to='#'> <img className=""/> Meus Pets</Link>
                <Link className="nav"  to='#'> <img className=""/>Agendamentos</Link>
                <Link className="nav"  to='#'> <img className=""/>Início</Link>
                <Link className="nav"  to='#'> <img className=""/>Sair</Link>
            </ul>
        </div>
    )
}
import { Link } from "react-router-dom"

export default function Aside() {
    return (
        <div className="comps-aside">
            <div className="usuario">
                <img src="" alt="Img usuario" />
                <h2>Nome S.</h2>
                <p>Seja bem vindo Nome S.</p>
            </div>
            <hr />
            <ul>
                <Link>Meus Pets</Link>
                <Link>Agendamentos</Link>
                <Link>Início</Link>
                <Link>Sair</Link>
            </ul>
        </div>
    )
}
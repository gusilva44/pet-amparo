import './login.scss'
import Logo from '../../assets/imagens/Logo.webp'

export default function Login (){
    return(
        <div className="comps-login">
            <div className="main-pets">
                <img src={Logo} alt="logo" />
                <div className="banner">
                    <h2>Faça seu login ou cadastre-se</h2>
                    <p>É rápido seguro e gratuito</p>
                    
                </div>
            </div>
        </div>
    )
}
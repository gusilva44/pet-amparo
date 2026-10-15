import Aside from '../components/aside/aside'
import Logo from '../assets/imagens/Logo.webp'
import '../scss/meuspets.scss'


export default function MeusPets(){
    return(
        <div className="pages-pets">
            <Aside/>
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
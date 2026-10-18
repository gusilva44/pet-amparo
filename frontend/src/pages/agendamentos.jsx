import '../scss/agendamentos.scss'
import Aside from '../components/aside/aside'
import Logo from '../assets/imagens/Logo.webp'
import Cachorro from '../assets/imagens/cachorro-agendamentos.png'

export default function Agendamentos() {
   return(
    <div className='page-Agendamentos'>
        <Aside/>
        <div className="main">
            <div className="logo">
                <img src={Logo} alt="logo" />
            </div>
            <div className='banner'>
                <section className='icon'>
                    <i class="fa-regular fa-calendar" ></i>
                </section>
                <section>
                    <h2>Agendamentos</h2>
                    <p>Aqui você pode visualizar seus <br />agendamentos  marcar um novo <br />atendimentro para o seu pet.</p>
                </section>
                <section>
                    <img src={Cachorro} alt="imagem cachorro" />
                </section>
            </div>
        </div>

    </div>
   )
}

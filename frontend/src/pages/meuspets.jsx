import Aside from '../components/aside/aside'
import Logo from '../assets/imagens/Logo.webp'
import Perfil from '../assets/imagens/icones/Perfil.png'
import '../scss/meuspets.scss'


export default function MeusPets(){
    return(
        <div className="pages-pets">
            <Aside/>
            <div className="main-pets">
                <div className="logo">
                  <img src={Logo} alt="logo" />  
                </div>
                <div className="meuPerfil">
                    <h2>Meu perfil</h2>
                    <div className="banner">
                        <section className='sta'>
                            <img src={Perfil} alt="foto usuario"/>
                            <section className='infos-pessoais'>
                                <h3>Nome S.</h3>
                                <p>nome@gmail.com</p>
                                <p> 11 9 5888-8888</p>
                            </section>
                        </section>
                      
                        <section className='editar'>
                            <button>Editar perfil</button>
                        </section>
                    </div>
                </div>
                <div className="meuspets">
                    <section className='ini'>
                        <section>
                            <h2>Meus pets</h2>
                            <p>Aqui estão os pets cadastrados na sua conta</p> 
                        </section>
                        <section className='botao'>
                            <button> + adicionar um novo pet</button>
                        </section>
                    </section>
                    
                    
                </div>
            </div>
            
        </div>
    )
}
import Header from "../components/header/header"
import Aside from "../components/aside/aside"
import '../scss/home.scss'


export default function Home(){
    return(
        <div className="home-page">
            <Header />
            <div className="main">
                <Aside />
                
                <div className="content">
                    <div className="banner">
                        <section className="textos">
                            <h2>
                                Saúde animal <span>acessível</span><br />para todos!
                            </h2>
                            <p>
                                Encontre unidades, serviços disponíveis e <br />informações para cuidar do seu pet.
                            </p><br />
                            <button>
                                Encontre uma unidade
                            </button>
                        </section>
                    
                    </div>
                    <div className="sobre">
                        <h1>
                            Sobre
                        </h1>
                        <div className="nosso-projeto">
                            <img className='.' src=""/>
                        </div>
                    </div>
                </div>

            </div>
    
        </div>
    )
}
import Header from "../components/header/header"
import Aside from "../components/aside/aside"
import Banner from '../assets/imagens/img-banner.png'
import Agendamento from '../assets/imagens/icones/calendario.svg'
import Pata from '../assets/imagens/icones/pata.svg'
import Consulta from '../assets/imagens/icones/consulta.svg'
import '../scss/home.scss'


export default function Home(){

    const cards = [
        {
            id: 1,
            img: Agendamento,
            titulo: "Agende seu atendimento",
            texto: "Consulte as informações das unidades e facilite o agendamento de atendimento para o seu pet."
        },
        {
            id: 2,
            img: Pata,
            titulo: "Cadastre seu melhor amigo",
            texto: "Cadastre seu pet e mantenha as informações dele organizadas. Assim, fica fácil encontrar os veterinários públicos e cuidar da saúde do seu companheiro.."
        }, 
        {
            id: 3,
            img: Consulta,
            titulo: "Mais cuidados com os animais",
            texto: "Ajudamos tutores a terem acesso a serviços veterinários essenciais de forma simples e rápida."
        },    
    ]

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
                        <section className="imagem">
                            <img className="img-banner" src={Banner} alt="" />
                        </section>
                    
                    </div>
                    <div className="sobre">
                        <h2>Sobre</h2> 
                        <div className="conteudo-sobre" >
                            <section className="sobre-esq">
                                <section className="sub-titulo" > 
                                    <img src={Pata} alt="icone-pata" />
                                    <h2>Nosso projeto</h2>
                                </section>
                                <section>
                                    <p> Este projeto foi desenvolvido como parte do nosso Trabalho de Conclusão de Curso (TCC) e tem como objetivo facilitar o acesso a informações sobre atendimento veterinário público.</p><br />
                                    <p>A plataforma permite que os usuários encontrem locais onde existem veterinários públicos, consultem informações sobre as unidades e encontrem um local adequado para levar seu pet para atendimento.</p>
                                </section>
                            </section>
                            <section>
                                <img  className="img-sobre" src="" alt="imagem veterianria cuidando de um cachorro" />
                            </section>
                        </div>

                       
                    </div>

                    <div className="cards">
                        {cards.map((card, key) => 
                            <div className="card" key={key}>
                                <img src={card.img} alt="icone" />
                                <h2>{card.titulo}</h2>
                                <p>{card.texto}</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
    
        </div>
    )
}
import Aside from "../../aside/aside";
import "./visaoGeral.scss";
import Localizacao from "../../../assets/imagens/icones/localizacaoAdm.svg";
import Veterinario from "../../../assets/imagens/icones/veterinarioAdm.svg";
import Calendario from "../../../assets/imagens/icones/calendarioAdm.svg";
import Agenda from "../../../assets/imagens/icones/agendaAdm.svg";
import Cadastro from "../../../assets/imagens/icones/cadastrar.svg"
import Usuario from "../../../assets/imagens/icones/usuario.svg";
import Serviço from "../../../assets/imagens/icones/servicos.svg"
import Grafico from "../../../assets/imagens/icones/grafico.svg"


export default function VisaoGeral() {

    const cards = [
    {
        id: 1,
        titulo: "Unidades Cadastradas",
        numero: 12,
        texto: "+ 2 este mês",
        icone: Localizacao
    },
    {
        id: 2,
        titulo: "Veterinários Ativos",
        numero: 10,
        texto: "+ 3 este mês",
        icone: Veterinario
    },
    {
        id: 3,
        titulo: "Serviços cadastrados",
        numero: 29,
        texto: "+ 7 este mês",
        icone: Calendario
    },
    {
        id: 4,
        titulo: "Pendências",
        numero: 80,
        texto: "Ver detalhes →",
        icone: Agenda
    }
];

   const acesso = [
    {
        id: 1,
        titulo: "Cadastrar unidade",
        texto: "Nova unidade veterinário",
        icone: Cadastro
    },
    {
        id: 2,
        titulo: "Cadastrar veterinário",
        texto: "Adicionar profissional",
        icone: Usuario
    },
    {
        id: 3,
        titulo: "Cadastrar serviço",
        texto: "Novo serviço disponivel",
        icone: Serviço
    },
    {
        id: 4,
        titulo: "Gerenciar usuários",
        texto: "Estáticas e indicadores",
        icone: Grafico
    }
];

    return (
        <div className="page-visao">
            <Aside />
            <main className="conteudo-visao">
                <header>
                    <div className="texto-admin">
                        <h1>Olá Administrador!</h1>
                        <p>Acompanhe a situação das unidades veterinarias públicas de São Paulo</p>
                    </div>
                   
                    <section className="cards">
                        {cards.map((card) => (
                        <div className="info" key={card.id}>
                            <div className="i">
                                <img src={card.icone} alt="icones" />
                            </div>

                             <div className="texto-card">
                                    <h2>{card.titulo}</h2>
                                    <h1 className="num-tempoReal">{card.numero}</h1>
                                    <p>{card.texto}</p>
                                    </div>
                        </div>
                            ))}
                    </section>
                   <section className="secao-inferior">
                        <div className="coluna-principal">
                            <h2>Acesso Rápido</h2>
                         <div className="cards-acesso">
                                {acesso.map((card) => (
                            <div className="info-acesso" key={card.id}>
                                <div className="i-acesso">
                                    <img src={card.icone} alt="Ícone" />
                                </div>

                                <div className="texto-card">
                                    <h2>{card.titulo}</h2>
                                    <p>{card.texto}</p>
                                </div>
                            </div>
    ))}
</div>
                        <div className="unidades-recentes">

                        </div>
                        </div>
                    </section>

                </header>
            </main>
        </div>
    );
}

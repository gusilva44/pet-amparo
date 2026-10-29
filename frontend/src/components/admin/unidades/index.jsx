import './index.scss';
import { unidades } from '../../../data/unidades'
import Editar from '../../../assets/imagens/icones/editarUnidade.svg'
import Opções from '../../../assets/imagens/icones/opcoesUnidade.svg'
import Info from '../../../assets/imagens/icones/infoUnidade.svg'




export default function UnidadesRecentes() {

    const restante = [
        {
            id: 1,
            icone: Editar
            
        },
        {
            id: 2,
            icone: Opções
        },
        {
            id: 3,
            icone: Info
        }
    ]

    return (
        
<div className="lista-unidades">
    <div className="coluna">
        <h4>Nome da unidade</h4>

        {unidades.map((unidade) => (
            <div className="nome-unidade" key={unidade.id}>
                <img src={unidade.img} alt="" />
                <span>{unidade.nome}</span>
            </div>
        ))}
    </div>

    <div className="coluna">
        <h4>Endereço</h4>

        {unidades.map((unidade) => (
            <div className="item">
                {unidade.localizacao}
            </div>
        ))}
    </div>

    <div className="coluna">
        <h4>Telefone</h4>
        {unidades.map((unidade) => (
            <div className="item">Não informado</div>
        ))}
    </div>

    <div className="coluna">
        <h4>Serviços</h4>
        {unidades.map((unidade) => (
            <div className="item">Não informado</div>
        ))}
    </div>

    <div className="coluna">
        <h4>Status</h4>

        {unidades.map((unidade) => (
            <div className="item" key={unidade.id}>
                Ativa
            </div>
        ))}
    </div>

    <div className="coluna">
        <h4 className='acoes-titulo'>Ações</h4>

        {unidades.map((unidade) => (
            <div className="acoes-unidade" key={unidade.id}>
                {restante.map((icone) => (
                    <button key={icone.id}>
                        <img src={icone.icone} alt="" />
                    </button>
                ))}
            </div>
        ))}
    </div>

</div>

    );
}

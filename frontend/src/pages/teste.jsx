
import Aside from '../components/aside/aside'
import '../scss/teste.scss'
import Cadastro from '../components/cadastro/cadastro'

export default function Teste(){
    return(
        <div className="teste">
            <Aside/>
            <div className="main-pets">
                <Cadastro/>
            </div>
           
        </div>
    )
}
import CadastroPet from '../components/cadastroPet/cadastroPet'
import Aside from '../components/aside/aside'

import '../scss/teste.scss'


export default function Teste(){
    return(
        <div className="teste">
            <Aside/>
            <div className="main-pets">
                <CadastroPet/>
            </div>
           
        </div>
    )
}
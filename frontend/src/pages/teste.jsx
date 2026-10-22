
import Aside from '../components/aside/aside'

import '../scss/teste.scss'
import Login from '../components/login/login'


export default function Teste(){
    return(
        <div className="teste">
            <Aside/>
            <div className="main-pets">
                <Login/>
            </div>
           
        </div>
    )
}
import Aside from '../components/aside/aside'
import Login from '../components/login/login'
import '../scss/meuspets.scss'


export default function MeusPets(){
    return(
        <div className="pages-pets">
            <Aside/>
            <div className="main-pets">
                <Login/>
            </div>
            
        </div>
    )
}
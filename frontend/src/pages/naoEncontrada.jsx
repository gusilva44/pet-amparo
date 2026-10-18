import '../scss/naoEncontrada.scss'
import imagem from '../assets/imagens/naoencontrada.png'
import { Link } from 'react-router-dom'

export default function naoEncontrada (){
    return(
        <div className="naoEncontrada">
            <section>
                <h1>Página não Encontrada</h1>
            </section>
            <section> 
                <img src={imagem} alt="" />
            </section>
           <section>
                <button>
                    <Link className='link' to='/'>Voltar a página inical</Link>
                </button>
           </section>
          
           
        </div> 
    )
    
}
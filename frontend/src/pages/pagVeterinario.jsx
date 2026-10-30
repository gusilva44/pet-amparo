import Aside from "../components/aside/aside"
import '../scss/pagVeterinario.scss'


export default function Veterinario() {
    return(


         <div className="main">
            <Aside />
            

            <div className="infor"> 
                
                 <h1>Agenda de consultas </h1>
                    <h3>Confira seus atendimentos </h3>

                    <div className="card-consultas">
                        <h3>Consultas de Hoje: </h3> 

                            <div className="dados">
                                <h3>Pendenetes </h3>
                                  <p>6</p>
                                <h3>Concluidas </h3>
                                 <p>7</p>
                             </div>

                             <div className="dias"> 
                                <h1>Consultas do dia: </h1>

                                <div className='cards'>
                                    <p>8:00 </p>
                                    
                                    <p>Ana </p>

                                    <p>Consulta de rotina </p>

                                       <button>
                                            <p> Concluir consulta </p>
                                        </button>
                                 </div>
                                
                                
                             </div>
                     </div>



            </div>
              
         </div>
    );

}
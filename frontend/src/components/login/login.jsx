import './login.scss'


export default function Login(){
    return(
        <div className="comps-login">
            <div className="container">

                <section className='titulo'>
                    <h2>Faça seu login ou Cadastre-se</h2>
                    <p>É rápido seguro e gratuito</p>
                </section>

                <section className='nav'>
                    <button className='entrar'>Entrar</button>
                    <button className='cadastro'>Cadastrar</button>
                </section>

                <section className='inputs'>
                    <p>Nome Completo</p>
                    <input type="text"  />
                    <p>Email</p>
                    <input type="text" />
                    <p>Senha</p>
                    <input type="password" />
                </section>

                <section className='botao'>
                    <button>Entrar</button>
                </section>
            </div>
        </div>
    )
}
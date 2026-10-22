import './cadastro.scss'

export default function Cadastro(){
    return(
        
            <div className="comps-cadastro">
                <div className="container">
                    <section className="titulo">
                        <h2>Faça seu login ou Cadastre-se</h2>
                        <p>É rápido seguro e gratuito</p>
                    </section>

                    <section className="nav">
                        <button className="entrar">Entrar</button>
                        <button className="cadastro">Cadastrar</button>
                    </section>

                    <section className="inputs">
                        <section className="campo-nome">
                            <p>Nome completo</p>
                            <input type="text" />
                        </section>

                        <section className="linha-data-cpf">
                            <div className="campo-data">
                                <label>Data de nascimento</label>
                                <input type="date" />
                            </div>

                            <div className="campo-cpf">
                                <label>CPF</label>
                                <input type="text" />
                            </div>
                        </section>

                        <section className="outros-campos">
                            <p>Telefone</p>
                            <input type="text" />

                            <p>Email</p>
                            <input type="text" />

                            <p>Endereço</p>
                            <input type="text" />

                            <p>Senha</p>
                            <input type="password" />
                        </section>

                        <section className="area-botao">
                            <button>Cadastre-se</button>
                        </section>
                    </section>
                </div>
</div>

    )
}
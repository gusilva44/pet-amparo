import './cadastroPet.scss'

export default function CadastroPet() {
    return (

<div className="comps-cadastro">

    <div className="container-cadastro">
        <div className='cabecalho-formulario'>
        <h2>Cadastre o seu pet aqui!</h2>
        <p>
            Preencha os dados do seu animal para <br>
            </br>cadastrá-lo no sistema.
        </p>
        </div>

        <div className="campos-formulario">

            <div className="campo-nome-pet">
                <p>Nome do pet:</p>
                <input type="text" />
            </div>

            <div className='grupo-especie-sexo'>

                <div className="campo-especie">
                    <p>Espécie:</p>
                    <select>
                        <option value="">Selecione uma opção</option>
                        <option value="cachorro">Cachorro</option>
                        <option value="gato">Gato</option>
                    </select>
                </div>

                <div className="campo-sexo">
                    <div><p>Sexo:</p></div>

                    <button className='botao-femea'>Fêmea</button>
                    <button className='botao-macho'>Macho</button>
                </div>

            </div>
            <div className="campo-raca">
            <p>Raça:</p>
            <input type="text" />
        </div>

        <div className='grupo-idade-porte'>

            <div className="campo-idade">
                <p>Idade</p>
                <select>
                    <option value="">Selecione uma opção</option>
                    <option value="filhote">Filhote (até 1 ano)</option>
                    <option value="jovem">Jovem (1 a 3 anos)</option>
                    <option value="adulto">Adulto (4 a 7 anos)</option>
                    <option value="idoso">Idoso (8 anos ou mais)</option>

                </select>
            </div>

            <div className="campo-porte">
                <p>Porte:</p>
                <select>
                    <option value="">Selecione uma opção</option>
                    <option value="pequeno">Pequeno (até 10kg)</option>
                    <option value="medio">Médio (11 kg a 25 kg )</option>
                    <option value="grande">Grande (26 kg ou mais)</option>
                    <option value="">Não sei informar</option>

                </select>
            </div>

        </div>

        <div className="campo-foto-pet">
            <p>Foto do animal</p>

            <br></br>

            <label className="area-upload-foto" htmlFor="foto">
                <input
                    type="file"
                    id="foto"
                    style={{display:"none"}}
                />

                <span>
                    Clique aqui para enviar uma foto
                    <br />
                    ou arraste aqui
                </span>
            </label>
        </div>

        <button className='botao-salvar'>
            Salvar pet
        </button>


        </div>


    </div>

</div>
)}

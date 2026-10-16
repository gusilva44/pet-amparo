import './cadastroPet.scss'

export default function CadastroPet() {
    return (

<div className="comps-cadastro">

    <div className="banner">
        <h2>Cadastre o seu pet aqui</h2>
        <p>
            Preencha os dados do seu animal para cadastrá-lo no sistema.
        </p>

        <div className="dados">

            <div className="campo-nome">
                <p>Nome do pet:</p>
                <input type="text" />
            </div>

            <div className='3'>

                <div className="campo-especie">
                    <p>Espécie:</p>
                    <select>
                        <option value="">Selecione uma opção</option>
                        <option value="cachorro">Cachorro</option>
                        <option value="gato">Gato</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>

                <div className="sexo">
                    <p>Sexo:</p>

                    <button className='botao-femea'>Femea</button>
                    <button className='botao-macho'>Macho</button>
                </div>

            </div>

        </div>

        <div className="campo-raca">
            <p>Raça:</p>
            <input type="text" />
        </div>

        <div className='2'>

            <div className="campo-idade">
                <p>Idade</p>
                <select>
                    <option value="">Selecione uma opção</option>
                    <option value=""></option>
                    <option value=""></option>
                    <option value=""></option>
                </select>
            </div>

            <div className="campo-porte">
                <p>Porte:</p>
                <select>
                    <option value="">Selecione uma opção</option>
                    <option value=""></option>
                    <option value=""></option>
                    <option value=""></option>
                </select>
            </div>

        </div>

        <div className="foto-animal">
            <p>Foto do animal</p>

            <label className="upload-foto" htmlFor="foto">
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
)}

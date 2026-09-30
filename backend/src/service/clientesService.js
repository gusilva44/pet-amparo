import { CRUD, RegrasDeNegocio } from '../repos/clientesRepo.js'
import { validarDataNascimento } from '../utils/date.js'

const crud = new CRUD()
const regras = new RegrasDeNegocio()

export async function cadastrarCliente(cliente){
    if(!cliente) throw new Error ("Erro ao enviar os dados.")

    const [ 
        verificarEmail, 
        verificarCpf, 
        verificarTelefone
    ] = await Promise.all([
        regras.Email(cliente),
        regras.Cpf(cliente),
        regras.Telefone(cliente)
    ])

    if(verificarCpf > 0){
        throw new Error("Cliente já cadastrado com esse CPF.")
    } else if (verificarEmail > 0) {
        throw new Error('Cliente já cadastrado com esse email.')
    } else if (verificarTelefone > 0) {
        throw new Error("Cliente já cadastrado com esse telefone.")
    }

    return crud.adicionarCliente(cliente)
}

export async function buscarClientePorId(id) {
    if(!id) throw new Error("Erro ao enviar o ID do cliente.")
    if(id < 0) throw new Error("O id deve ser inteiro e positivo.")

    return crud.buscarClientePorId(id)
}

export async function buscarTodosClientes() {
    return crud.buscarTodosClientes()
}

export async function deletarCliente(id) {
    if(!id) throw new Error("Erro ao enviar o ID do cliente.")
    if(id < 0) throw new Error("O id deve ser inteiro e positivo.")

    return crud.deletarCliente(id)
}

export async function atualizarCliente(cliente, id) {
    if(!cliente) throw new Error("Todos os dados devem ser preenchidos.")
    
    if(/\d/.test(cliente.nome)) throw new Error("Não pode haver números no nome.")
    
    validarDataNascimento(cliente.data_nasc)

    if(cliente.telefone.length > 14) throw new Error("O telefone está maior do que o normal.")
    if(cliente.telefone.length < 0) throw new Error("O telefone não pode ter o tamanho menor que 0.")

    const cpfLimpo = cliente.cpf.replace(/\D/g, "");
    if(cpfLimpo.length > 11) throw new Error("CPF grande demais.")
    
    if(!cliente.email.includes('@') || !cliente.email.includes('.com')) throw new Error("Digite o email corretamente.")
    if(!id) throw new Error("Digite corretamnete o id do cliente.")
    if(id < 0) throw new Error("O id deve ser inteiro e positivo.")
    
    return crud.atualizarCliente(cliente, id)
}
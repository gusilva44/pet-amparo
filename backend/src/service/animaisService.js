import * as db from '../repos/animaisRepo.js'

function validarId(id) {
    if (!Number.isInteger(id) || id <= 0) throw new Error('O ID deve ser um número inteiro e positivo.')
}

function validarAnimal(animal) {
    if (!animal) throw new Error('Os dados do animal são obrigatórios.')
    if (!animal.nome || animal.nome.trim() === '') throw new Error('O nome do animal é obrigatório.')
    if (!animal.especie || animal.especie.trim() === '') throw new Error('A espécie do animal é obrigatória.')
    if (!animal.raca || animal.raca.trim() === '') throw new Error('A raça do animal é obrigatória.')
    if (!animal.rga || animal.rga.trim() === '') throw new Error('O RGA do animal é obrigatório.')
    if (!Number.isInteger(animal.idade) || animal.idade < 0) throw new Error('A idade do animal deve ser um número inteiro maior ou  a zero.')
    if (animal.idade > 38) throw new Error('O animal não pode ter mais de 38 anos.')
    if (animal.sexo !== 'M' && animal.sexo !== 'F') throw new Error('O sexo deve ser M ou F.')
    if (!animal.porte || animal.porte.trim() === '') throw new Error('O porte do animal é obrigatório.')
    if (animal.e_vacinado !== true && animal.e_vacinado !== false) throw new Error('O campo e_vacinado deve ser verdadeiro ou falso.igual')
}

// BUSCAR TODOS OS MEUS ANIMAIS
export async function buscarTodosAnimais(idCliente) {
    validarId(idCliente)

    return db.buscarTodosAnimaisPorCliente(
        idCliente
    )
}


// BUSCAR UM DOS MEUS ANIMAIS
export async function buscarAnimalPorId(idAnimal, idCliente) {
    validarId(idAnimal)
    validarId(idCliente)

    const animal = await db.buscarAnimalPorId(idAnimal, idCliente)
    if (!animal) throw new Error('Animal não encontrado.')
    
    return animal
}


// CADASTRAR ANIMAL
export async function adicionarAnimal(animal, idCliente) {
    validarId(idCliente)
    validarAnimal(animal)

    const rga = animal.rga.trim()
    const animalExistente = await db.buscarAnimalPorRga(rga)

    if (animalExistente) throw new Error('Já existe um animal cadastrado com esse RGA.')

    const dados = {
        nome: animal.nome.trim(),
        especie: animal.especie.trim(),
        raca: animal.raca.trim(),
        rga,
        idade: animal.idade,
        sexo: animal.sexo,
        porte: animal.porte.trim(),
        foto: animal.foto || null,
        e_vacinado: animal.e_vacinado
    }

    return db.adicionarAnimal(
        dados,
        idCliente
    )
}

// ATUALIZAR ANIMAL
export async function atualizarAnimal(animal, idAnimal, idCliente) {
    validarId(idAnimal)
    validarId(idCliente)
    validarAnimal(animal)

    const animalAtual = await db.buscarAnimalPorId(idAnimal, idCliente)
    if (!animalAtual) throw new Error('Animal não encontrado.')

    const rga = animal.rga.trim()

    const animalComRga = await db.buscarAnimalPorRga(rga)

    if (animalComRga && animalComRga.id_animal !== idAnimal) throw new Error('Já existe outro animal cadastrado com esse RGA.')

    const dados = {
        nome: animal.nome.trim(),
        especie: animal.especie.trim(),
        raca: animal.raca.trim(),
        rga,
        idade: animal.idade,
        sexo: animal.sexo,
        porte: animal.porte.trim(),
        foto: animal.foto || null,
        e_vacinado: animal.e_vacinado
    }

    return db.atualizarAnimal(dados, idAnimal, idCliente)
}

// DELETAR ANIMAL
export async function deletarAnimal(idAnimal, idCliente){
    validarId(idAnimal)
    validarId(idCliente)

    const resultado = await db.deletarAnimal(idAnimal, idCliente)
    if (!resultado) throw new Error('Animal não encontrado.')

    return resultado
}
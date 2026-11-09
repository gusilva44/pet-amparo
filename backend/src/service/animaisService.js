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
    if (animal.foto && !/^data:image\/(png|jpe?g|webp);base64,/i.test(animal.foto)) throw new Error('A foto do pet deve ser PNG, JPG ou WEBP.')
    if (animal.foto && animal.foto.length > 2800000) throw new Error('A foto do pet deve ter no mÃ¡ximo 2 MB.')
}

// Fotos enviadas pelo cliente s\u00e3o guardadas como data URLs no banco.
function validarFoto(foto) {
    if (foto && !/^data:image\/(png|jpe?g|webp);base64,/i.test(foto)) throw new Error('A foto do pet deve ser PNG, JPG ou WEBP.')
    if (foto && foto.length > 2800000) throw new Error('A foto do pet deve ter no m\u00e1ximo 2 MB.')
}

export async function buscarTodosAnimais(idCliente) {
    validarId(idCliente)

    return db.buscarTodosAnimaisPorCliente(
        idCliente
    )
}


export async function buscarAnimalPorId(idAnimal, idCliente) {
    validarId(idAnimal)
    validarId(idCliente)

    const animal = await db.buscarAnimalPorId(idAnimal, idCliente)
    if (!animal) throw new Error('Animal não encontrado.')
    
    return animal
}


export async function adicionarAnimal(animal, idCliente) {
    validarId(idCliente)
    validarAnimal(animal)
    validarFoto(animal.foto)

    let { nome, especie, raca, rga, idade, sexo, porte, foto, e_vacinado } = animal

    const rgaValidado = rga.trim()
    const animalExistente = await db.buscarAnimalPorRga(rga)

    if (animalExistente) throw new Error('Já existe um animal cadastrado com esse RGA.')

    if(Number(idade) >= 30 ) throw new Error("Um animal não consegue viver mais que 30 anos")

    if (!["pequeno", "medio", "grande", "nao_informado"].includes(porte)) porte = "nao_informado"

    if (!["M", "F"].includes(sexo)) sexo = "desconhecido"
    
    const dados = {
        nome: nome.trim(),
        especie: especie.trim(),
        raca: raca.trim(),
        rga: rgaValidado,
        idade: idade,
        sexo: sexo,
        porte: porte.trim(),
        foto: foto || null,
        e_vacinado: e_vacinado
    }

    return db.adicionarAnimal(
        dados,
        idCliente
    )
}

export async function atualizarAnimal(animal, idAnimal, idCliente) {
    validarId(idAnimal)
    validarId(idCliente)
    validarAnimal(animal)
    validarFoto(animal.foto)

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

export async function deletarAnimal(idAnimal, idCliente){
    validarId(idAnimal)
    validarId(idCliente)

    const resultado = await db.deletarAnimal(idAnimal, idCliente)
    if (!resultado) throw new Error('Animal não encontrado.')

    return resultado
}

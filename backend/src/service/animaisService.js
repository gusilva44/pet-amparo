import { CRUD, RegrasDeNegocio } from "../repos/animaisRepo.js";


const crud = new CRUD()
const regras = new RegrasDeNegocio()

export default function buscarAnimalPorId(id){
    if(!id) throw new Error("Error ao buscar o id.")
    if(id < 0) throw new Error("O id deve ser positivo e inteiro.")

    return crud.buscarAnimalPorId(id)
}

export default function buscarTodosAnimal(){
    return crud.buscarTodosAnimal()
}

export default function deletarAnimal(id){
    if(!id) throw new Error("Error ao buscar o id.")
    if(id < 0) throw new Error("O id deve ser positivo e inteiro.")

    return crud.deletarAnimal(id)
}

export default function adicionarAnimal(animal){
    if(!animal) throw new Error("Insira os dados corretamente.")
    if(!animais.nome) throw new Error("Insira o nome corretamente")
    if(!animais.especie) throw new Error("Insira a especie corretamente")
    if(!animais.raca) throw new Error("Insira a raça corretamente")
    if(!animais.rga) throw new Error("Insira a rga corretamente")
    if(!animais.idade) throw new Error("Insira a idade corretamente")
    if(animais.idade > 38) throw new Error("O animal não pode ter mais de 38 anos.")
    if(!animais.sexo) throw new Error("Insira a sexo corretamente")
    if(!animais.porte) throw new Error("Insira a porte corretamente")
    if(!animais.e_vacinado) throw new Error("Insira o 'e_vacinado' corretamente")
    
    return crud.adicionarAnimal(animal)
}

export default function atualizarAnimal(animal, id){
    if(!animal) throw new Error("Insira os dados corretamente.")
    if(!animais.nome) throw new Error("Insira o nome corretamente")
    if(!animais.especie) throw new Error("Insira a especie corretamente")
    if(!animais.raca) throw new Error("Insira a raça corretamente")
    if(!animais.rga) throw new Error("Insira a rga corretamente")
    if(!animais.idade) throw new Error("Insira a idade corretamente")
    if(animais.idade > 38) throw new Error("O animal não pode ter mais de 38 anos.")
    if(!animais.sexo) throw new Error("Insira a sexo corretamente")
    if(!animais.porte) throw new Error("Insira a porte corretamente")
    if(!animais.e_vacinado) throw new Error("Insira o 'e_vacinado' corretamente")
        
    if(!id) throw new Error("Error ao buscar o id.")
    if(id < 0) throw new Error("O id deve ser positivo e inteiro.")

    return crud.atualizarAnimais(animal)
}
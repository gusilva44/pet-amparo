export default function horaAtual(){
    const agora = new Date()
    const data = `${agora.toLocaleTimeString()} ${agora.toLocaleDateString()}`
    console.log(data) 
}

export function validarDataNascimento(dataNascimentoString) {
    const dataNascimento = new Date(dataNascimentoString);
    const hoje = new Date();
  
    if (isNaN(dataNascimento.getTime())) {
      throw new Error("Formato de data inválido. Use AAAA-MM-DD.");
    }

    let idade = hoje.getFullYear() - dataNascimento.getFullYear();

    if (idade > 100) {
      throw new Error("Idade inválida. O cliente não pode ter mais de 100 anos.");
    }
  
    if (idade < 0) {
      throw new Error("A data de nascimento não pode ser no futuro.");
    }
  
    return true;
}
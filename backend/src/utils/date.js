export default function horaAtual(){
    const agora = new Date()
    const data = `${agora.toLocaleTimeString()} ${agora.toLocaleDateString()}`
    console.log(data) 
}

horaAtual()
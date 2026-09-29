export default function horaAtual(){
    const agora = new Date()
    const data = agora.getTimezoneOffset() + " " + agora.toLocaleTimeString
    console.log(data)
}

horaAtual()
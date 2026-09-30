import clientes from './controllers/clientesController.js'

export default function adicionarRotas(api){
    api.use(clientes)
}
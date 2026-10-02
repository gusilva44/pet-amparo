import auth from './controllers/authController.js'
import clientes from './controllers/clientesController.js'

export default function adicionarRotas(api) {
    api.use(auth)
    api.use(clientes)
}
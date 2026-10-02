import auth from './controllers/authController.js'
import clientes from './controllers/clientesController.js'
import animais from './controllers/animaisController.js'

export default function adicionarRotas(api) {
    api.use(auth)
    api.use(clientes)
    api.use(animais)
}
import auth from './controllers/authController.js'
import clientes from './controllers/clientesController.js'
import animais from './controllers/animaisController.js'
import admin from './controllers/adminController.js'
import servicos from './controllers/servicosController.js'
import agendamentos from './controllers/agendamentosController.js'
import veterinarios from './controllers/veterinariosController.js'
import medicamentos from './controllers/medicamentosController.js'
import unidades from './controllers/unidadesController.js'

export default function adicionarRotas(api) {
    api.use(auth)
    api.use(clientes)
    api.use(animais)
    api.use(admin)
    api.use(servicos)
    api.use(agendamentos)
    api.use(veterinarios)
    api.use(medicamentos)
    api.use(unidades)
}

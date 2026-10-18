import * as db from '../repos/veterinariosRepo.js'

export async function exigirVeterinario(req, res, next) {
    try {
        if (req.usuario.tipo !== 'veterinario') {
            return res.status(403).json({ mensagem: 'Acesso permitido apenas para veterinários.' })
        }

        const veterinario = await db.buscarVeterinarioPorUsuario(req.usuario.id_usuario)
        if (!veterinario) {
            return res.status(404).json({ mensagem: 'Cadastro de veterinário não encontrado.' })
        }

        req.veterinario = veterinario
        next()
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao identificar o veterinário.' })
    }
}

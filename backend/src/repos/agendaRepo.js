import { db } from "./connection.js";

export class CRUD {
    async buscarTodosAgendamento() {
        const [resultado] = await db.query(`
            SELECT * FROM agendamento 
        `, [])

        return resultado
    }

    async buscarAgendamentoPorId(id){
        const [resultado] = await db.query(`
            SELECT * FROM agendamento
            WHERE agendamento_id = ?
        `, [id])

        return resultado[0]
    }

    async adicionarAgendamento(agendamento) {
        const [resultado] = await db.query(`
            INSERT INTO agendamento(servico, unidade, dia, hora))
            VALUES (?, ?, ?, ?)
        `, [
            agendamento.veterinario,
            agendamento.servico,
            agendamento.unidade,
            agendamento.dia,
            agendamento.hora
        ])

        return resultado.insertId
    }

    async atualizarAgendamento(agendamento, id) {
        const [resultado] = await db.query(`
            UPDATE agendamento
            SET servico = ?, 
                unidade = ?, 
                dia = ?, 
                hora = ?
            WHERE id_agendamento = ?
        `, [
            agendamento.veterinario,
            agendamento.servico,
            agendamento.unidade,
            agendamento.dia,
            agendamento.hora,
            id
        ])

        return resultado.affectedRows
    }

    async deletarAgendamento(id) {
        const [resultado] = await db.query(`
            DELETE FROM agendamento
            WHERE id_agendamento = ?
        `, [id])

        return resultado.affectedRows
    }
}

export class RegrasDeNegocio {
    async agenda({ id_cliente, id_animal }) {
        const [res] = await db.query(`
            SELECT * FROM agendamento
            WHERE hora = ?
        `, [hora])

        return res
    }

   
}
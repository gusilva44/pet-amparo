import 'dotenv/config'
import mysql from 'mysql2/promise'

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER
})

export { db }
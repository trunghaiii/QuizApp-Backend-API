require('dotenv').config()
const postgresDb = require('knex')({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
        // host: 'postgresql-octagonal-79620' || process.env.DB_HOST,
        // port: Number(process.env.DB_PORT),
        // user: process.env.DB_USER,
        // password: process.env.DB_PASS,
        // database: 'postgres'
    }
});


module.exports = postgresDb;
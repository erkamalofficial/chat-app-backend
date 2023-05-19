const mysql2 = require('mysql2')
const dotenv = require('dotenv');
dotenv.config()

const connectionPool = mysql2.createConnection({
    host: process.env.MYSQL_DB_HOSTNAME,
    user: process.env.MYSQL_DB_USERNAME,
    password: process.env.MYSQL_DB_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
    port: Number(process.env.MYSQL_DB_PORT)
});

const MySqlQuery = (query) => new Promise((resolve, reject) => {
    connectionPool.connect((err) => {
        if (err) return reject(err)
        connectionPool.query(query, (err, rows) => {
            if (err) return reject(err)
            resolve(rows)
        })
    });
})




module.exports = {
    MySqlQuery
}
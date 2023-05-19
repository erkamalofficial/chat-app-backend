const { MySqlQuery } = require("../../db/MysqlQuery");



const getUserByUsername = async (username) => {
    try {
        const [result] = await MySqlQuery(`SELECT * FROM ellotdb.users WHERE username='${username.trim()}'`);
        return result ? result : null
    } catch (error) {
        console.log('createNewMessage Error => ', error)
        return null
    }
}
module.exports = {
    getUserByUsername
}
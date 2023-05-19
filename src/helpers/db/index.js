const { MySqlQuery } = require("../../db/MysqlQuery")
const { QueryHelper } = require("../../db/QueryHelper")
const uuid = require('uuid')



const getUserByUsername = async (username) => {
    try {
        const user = await MySqlQuery(QueryHelper.getUserByUsernameQuery(username));
        return user[0].user_id
    } catch (error) {
        throw error
    }
}

const createNewMessage = async ({ sender, receiver, message, message_type, media_url = "" }) => {
    try {
        const sender_id = await getUserByUsername(sender)
        const receiver_id = await getUserByUsername(receiver)
        const messageResult = await MySqlQuery(QueryHelper.createMessageQuery(sender_id, receiver_id, message, message_type));

        const createdMsg = await MySqlQuery(`select * from ellotdb.messages where message_id=${messageResult.insertId}`);
        console.log('msg_query_result =>', createdMsg[0])

        return {}
    } catch (error) {
        console.log('createNewMessage Error => ', error)
        return null
    }
}


const createNewSession = async ({ sender, receiver, message, media_url }) => {
    try {
        const currentDateTime = new Date().toISOString()
        const msg_query = `INSERT INTO ellotdb.messages VALUES ('${uuid()}', '${message}', '${media_url}', '${currentDateTime}')`
        const msg_query_result = await MySqlQuery(msg_query);
        console.log('msg_query_result =>', msg_query_result)

        const msg_recipient_query = `INSERT INTO ellotdb.message_recipient VALUES ('${uuid()}', '${username}', '', '', '${phone_number}', ${false})`
        await MySqlQuery(msg_recipient_query);
    } catch (error) {
        console.log('createNewMessage Error => ', error)
        return null
    }
}

module.exports = {
    createNewMessage
}
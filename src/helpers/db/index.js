const { MySqlQuery } = require("../../db/MysqlQuery.js")
const { QueryHelper } = require("../../db/QueryHelper.js")
const uuid = require('uuid')



const getUserByUsername = async (username) => {
    try {
        const user = await MySqlQuery(QueryHelper.getUserByUsernameQuery(username));
        return user[0]
    } catch (error) {
        throw error
    }
}

const createNewMessage = async ({ sender, receiver, message, message_type, media_url = "" }) => {
    try {
        const sender_id = await getUserByUsername(sender)
        const receiver_id = await getUserByUsername(receiver)
        const messageResult = await MySqlQuery(QueryHelper.createMessageQuery(sender_id.user_id, receiver_id.user_id, message, message_type));

        const createdMsg = await MySqlQuery(`select * from ellotdb.messages where message_id=${messageResult.insertId}`);
        console.log('msg_query_result =>', createdMsg[0])

        return {}
    } catch (error) {
        console.log('createNewMessage Error => ', error)
        return null
    }
}


const getAllActiveUsers = async () => {
    try {
        const users = await MySqlQuery(`SELECT * FROM ellotdb.users`);
        return users
    } catch (error) {
        throw error
    }
}

const getUsersBots = async (user_id) => {
    try {
        const bots = await MySqlQuery(`SELECT * FROM ellotdb.private_bots where user_id='${user_id}'`);
        return bots
    } catch (error) {
        throw error
    }
}

const getActiveUsersChats = async (user_id) => {
    try {
        let user_chats = []
        const db_users = await getAllActiveUsers()

        const other_users = db_users.filter((user) => user.user_id !== user_id)
        for (let i = 0; i < other_users.length; i++) {
            const messages = await MySqlQuery(`SELECT * FROM ellotdb.messages where sender_id='${user_id}' AND receiver_id='${other_users[i].user_id}'`);
            user_chats.push({
                chat_id: other_users[i].user_id,
                channel_name: other_users[i].username,
                messages: messages,
                is_typing: false
            })
        }


        let user_bot_chats = []
        const user_bots = await getUsersBots()
        for (let i = 0; i < user_bots.length; i++) {
            const messages = await MySqlQuery(`SELECT * FROM ellotdb.messages where sender_id='${user_id}' AND receiver_id='${user_bots[i].user_id}'`);
            user_bot_chats.push({
                chat_id: user_bots[i].user_id,
                channel_name: user_bots[i].username,
                messages: messages,
                is_typing: false
            })
        }
        return {user_chats, user_bot_chats}
    } catch (error) {
        throw error
    }
}

module.exports = {
    getUserByUsername,
    createNewMessage,
    getAllActiveUsers,
    getUsersBots,
    getActiveUsersChats
}
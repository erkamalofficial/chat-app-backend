const { MySqlQuery } = require("../../db/MySqlQuery.js")
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

const createNewMessage = async ({ sender_id, receiver_id, message, message_type, media_url = "" }) => {
    try {
        const messageResult = await MySqlQuery(QueryHelper.createMessageQuery(sender_id, receiver_id, message, message_type));
        const createdMsg = await MySqlQuery(`select * from ellotdb.messages where message_id=${messageResult.insertId}`);

        return createdMsg[0]
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
            const sent_messages = await MySqlQuery(`SELECT * FROM ellotdb.messages where sender_id='${user_id}' AND receiver_id='${other_users[i].user_id}'`);
            const received_messages = await MySqlQuery(`SELECT * FROM ellotdb.messages where sender_id='${other_users[i].user_id}' AND receiver_id='${user_id}'`);
            user_chats.push({
                chat_id: other_users[i].user_id,
                channel_name: other_users[i].username,
                messages: sent_messages.concat(received_messages).sort(function (a, b) {
                    return new Date(a.created_at) - new Date(b.created_at)
                }),
                is_typing: false
            })
        }

        let user_bot_chats = []
        const user_bots = await getUsersBots(user_id)
        for (let i = 0; i < user_bots.length; i++) {
            const sent_messages = await MySqlQuery(`SELECT * FROM ellotdb.messages where sender_id='${user_id}' AND receiver_id='${user_bots[i].bot_id}'`);
            const received_messages = await MySqlQuery(`SELECT * FROM ellotdb.messages where sender_id='${user_bots[i].bot_id}' AND receiver_id='${user_id}'`);

            user_bot_chats.push({
                chat_id: user_bots[i].bot_id,
                channel_name: user_bots[i].bot_name,
                messages: sent_messages.concat(received_messages).sort(function (a, b) {
                    return new Date(a.created_at) - new Date(b.created_at)
                }),
                is_typing: false
            })
        }
        return { user_chats, user_bot_chats }
    } catch (error) {
        throw error
    }
}


// Session


const createUserSession = async (user_id, socket_id) => {
    try {
        const session = await MySqlQuery(QueryHelper.getSession(user_id));
        if (session[0]) return await MySqlQuery(QueryHelper.updatedSession(user_id, socket_id));
        await MySqlQuery(QueryHelper.createSession(user_id, socket_id));
    } catch (error) {
        console.log('createUserSession Error => ', error)
    }
}

const deleteUserSession = async (user_id) => {
    try {
        await MySqlQuery(QueryHelper.deleteSession(user_id));
    } catch (error) {
        console.log('createUserSession Error => ', error)
    }
}

const getUserSession = async (user_id) => {
    try {
        const session = await MySqlQuery(QueryHelper.getSession(user_id));
        return session[0].socket_id
    } catch (error) {
        console.log('createUserSession Error => ', error)
    }
}


module.exports = {
    getUserByUsername,
    createNewMessage,
    getAllActiveUsers,
    getUsersBots,
    getActiveUsersChats,

    createUserSession,
    deleteUserSession,
    getUserSession
}
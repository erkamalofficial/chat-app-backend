
const QueryHelper = {
    getUserByUsernameQuery: (username) => {
        return `SELECT * FROM ellotdb.users WHERE username='${username}'`;
    },

    createMessageQuery: (sender_id, receiver_id, message, message_type, media_url = "") => {
        const currentDateTime = new Date().toISOString()
        return `INSERT INTO ellotdb.messages (message_body, media_url, sender_id, receiver_id, message_type, created_at) VALUES ('${message}', '${media_url}', '${sender_id}', '${receiver_id}', '${message_type}', '${currentDateTime}')`;
    },
    createMessageRecipientQuery: (message_id, sender_id, receiver_id) => {
        return `INSERT INTO ellotdb.message_recipient (message_id, sender_id, receiver_id, is_read) VALUES (${message_id}, '${sender_id}', '${receiver_id}', ${false})`;
    },



    getSession: (user_id) => {
        return `SELECT * FROM ellotdb.sessions WHERE user_id='${user_id}'`;
    },
    createSession: (user_id, socket_id) => {
        return `INSERT INTO ellotdb.sessions (user_id, socket_id) VALUES ('${user_id}', '${socket_id}')`;
    },
    updatedSession: (user_id, socket_id) => {
        return `UPDATE ellotdb.sessions set socket_id='${socket_id}' WHERE user_id='${user_id}' `;
    },
    deleteSession: (user_id) => {
        return `DELETE FROM ellotdb.sessions  WHERE user_id='${user_id}' `;
    }
}

module.exports = {
    QueryHelper
}
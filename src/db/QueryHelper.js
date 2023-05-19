
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
    }
}

module.exports = {
    QueryHelper
}
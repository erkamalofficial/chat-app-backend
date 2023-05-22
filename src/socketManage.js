const events = require('./events')
const { createNewMessage, getAllActiveUsers, getUsersBots, getActiveUsersChats, createUserSession, deleteUserSession, getUserSession } = require('./helpers/db')
const { getUserByUsername } = require('./helpers/db/userTableQueries')
const methods = require('./methods')
const ELLOGPT = "ellogpt"
let users = {}
let chatsList = ['Public_Channel']
let communityChat = methods.createChat({ name: "ElloGPT Channel", description: "Public room" })
let chats = [communityChat]

const messageType = {
    user: 'user',
    bot: 'bot',
    channel: 'channel',
};

module.exports = io => socket => {

    socket.on(events.IS_USER, async (nickname, cb) => {
        console.log("events.IS_USER called", nickname)
        const isUser = await getUserByUsername(nickname)
        if (isUser) {
            await getUserByUsername(nickname)
            await createUserSession(isUser.user_id, socket.id)
            return cb({ isUser: false, user: { ...isUser, socketId: socket.id } })
        }
        if (methods.isUser(users, nickname)) return cb({ isUser: true, user: null })
        // if (methods.isUser(users, nickname)) return cb({ isUser: true, user: null })
        cb({ isUser: false, user: methods.createUser(nickname, socket.id) })
    })

    socket.on(events.NEW_USER, async (user) => {
        console.log("events.NEW_USER called")
        try {
            let userList = {}
            let userBotsList = {}
            const userBots = await getUsersBots(user.user_id)
            userBots.map((bot) => {
                userBotsList[bot.bot_id] = bot
            })
            const allUsers = await getAllActiveUsers()
            allUsers.map((user) => {
                userList[user.user_id] = user
            })

            socket.user = user

            io.emit(events.NEW_USER, { userList, userBotsList })
        } catch (error) {
            console.log("events.IS_USER Error", error)
        }
    })

    socket.on(events.INIT_CHATS, async (current_user_id, cb) => {
        console.log("events.INIT_CHATS called", current_user_id)
        const { user_chats, user_bot_chats } = await getActiveUsersChats(current_user_id)

        cb({ user_chats, user_bot_chats })
    })

    socket.on(events.LOGOUT, () => {
        console.log("events.LOGOUT called")
        if (socket.user) {
            users = methods.delUser(users, socket.user.nickname)
            const private_bot = `${ELLOGPT.toLowerCase()}_${nickname.toLowerCase()}`
            users = methods.delUser(users, private_bot)
            io.emit(events.LOGOUT, { newUsers: users, outUser: socket.user.nickname })
        }
    })

    socket.on('disconnect', async () => {
        console.log("events.disconnect called")
        if (socket.user) {
            await deleteUserSession(socket.user.user_id)
            users = methods.delUser(users, socket.user.nickname)
            users = methods.delUser(users, socket.user.nickname)
            io.emit(events.LOGOUT, { newUsers: users, outUser: socket.user.nickname })
        }
    })

    socket.on(events.MESSAGE_SEND, ({ channel, msg }) => {
        console.log("events.MESSAGE_SEND called", { channel, msg })
        if (socket.user) {
            let message = methods.createMessage(msg, socket.user.nickname)
            io.emit(events.MESSAGE_SEND, ({ channel, message }))
        }
    })

    socket.on(events.TYPING, ({ channel, isTyping }) => {
        console.log("events.TYPING called", { channel, isTyping })
        if (socket.user) {
            socket.user && io.emit(events.TYPING, { channel, isTyping, sender: socket.user.nickname })
        }
    })

    socket.on(events.P_MESSAGE_SEND, async ({ receiver, msg, channelType }) => { //working.....
        console.log("events.P_MESSAGE_SEND called", channelType)
        if (socket.user && receiver) {
            const message = await createNewMessage({ sender_id: socket.user.user_id, receiver_id: channelType === "bot" ? receiver.bot_id : receiver.user_id, message: msg, message_type: messageType['user'] })

            socket.emit(events.P_MESSAGE_SEND, { channel: channelType === "bot" ? receiver.bot_id : receiver.user_id, message, channelType })

            if (channelType === "user") {
                const receiverSocketId = await getUserSession(receiver.user_id)
                console.log("receiverSocketId +>", receiverSocketId)
                socket.to(receiverSocketId).emit(events.P_MESSAGE_SEND, { channel: socket.user.user_id, message, channelType })
            }

        }
    })

    socket.on(events.BOT_MESSAGE_SEND, async ({ bot_id, msg }) => {
        console.log("events.BOT_MESSAGE_SEND called", { bot_id, msg })
        if (socket.user) {
            let socket_user_id = socket.user.user_id
            const message = await createNewMessage({ sender_id: bot_id, receiver_id: socket_user_id, message: msg, message_type: messageType['bot'] })
            socket.emit(events.P_MESSAGE_SEND, { channel: bot_id, message, channelType: "bot" })
        }
    })

    socket.on(events.P_TYPING, ({ receiver, isTyping }) => {
        console.log("events.P_TYPING called", { receiver, isTyping })
        if (socket.user) {
            let sender = socket.user.nickname
            socket.to(receiver).emit(events.P_TYPING, { channel: sender, isTyping })
        }
    })

    socket.on(events.CHECK_CHANNEL, ({ channelName, channelDescription }, cb) => {
        console.log("events.CHECK_CHANNEL called", { channelName, channelDescription })
        if (methods.isChannel(channelName, chatsList)) {
            cb(true)
        } else {
            let newChat = methods.createChat({ name: channelName, description: channelDescription })
            chatsList.push(channelName)
            chats.push(newChat)
            io.emit(events.CREATE_CHANNEL, newChat)
            cb(false)
        }
    })
}

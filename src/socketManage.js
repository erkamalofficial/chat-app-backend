const events = require('./events')
const methods = require('./methods')
const ELLOGPT = "ellogpt"
let users = {}
let chatsList = ['ElloGPT']
let communityChat = methods.createChat({name: "ElloGPT", description: "Private room" })
let chats = [communityChat]

module.exports = io => socket => {

    socket.on(events.IS_USER, (nickname, cb) => {
        console.log("events.IS_USER called", nickname)
        methods.isUser(users, nickname) ? cb({ isUser: true, user: null }) :
            cb({ isUser: false, user: methods.createUser(nickname, socket.id) })
    })

    socket.on(events.NEW_USER, user => {
        users = methods.addUsers(users, user)
        const private_bot = `${ELLOGPT.toLowerCase()}_${user.nickname.toLowerCase()}`
        users = methods.addUsers(users, { nickname: private_bot, socketId: private_bot })
        socket.user = user
        io.emit(events.NEW_USER, { newUsers: users })
       
    })

    socket.on(events.INIT_CHATS, cb => {
        console.log("events.INIT_CHATS called")
        cb(chats)
    })

    socket.on(events.LOGOUT, () => {
        console.log("events.LOGOUT called")
        if (socket.user) {
            users = methods.delUser(users, socket.user.nickname)
            io.emit(events.LOGOUT, { newUsers: users, outUser: socket.user.nickname })
        }
    })

    socket.on('disconnect', () => {
        console.log("events.disconnect called")
        if (socket.user) {
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

    socket.on(events.P_MESSAGE_SEND, ({ receiver, msg }) => {
        console.log("events.P_MESSAGE_SEND called", { receiver, msg })
        if (socket.user) {
            let sender = socket.user.nickname
            let message = methods.createMessage(msg, sender)
            socket.to(receiver.socketId).emit(events.P_MESSAGE_SEND, { channel: sender, message })
            socket.emit(events.P_MESSAGE_SEND, { channel: receiver.nickname, message })
        }
    })

    socket.on(events.BOT_MESSAGE_SEND, ({ receiver, msg }) => {
        console.log("events.BOT_MESSAGE_SEND called", { receiver, msg })
        if (socket.user) {
            let sender = socket.user.nickname
            const private_bot = `${ELLOGPT.toLowerCase()}_${sender.toLowerCase()}`
            let message = methods.createMessage(msg, private_bot)
            // socket.to(receiver.socketId).emit(events.P_MESSAGE_SEND, { channel: private_bot, message })
            socket.emit(events.P_MESSAGE_SEND, { channel: private_bot, message })
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

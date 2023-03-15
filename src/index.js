const express = require('express')
const cors = require('cors')
const app = express()
const Server = require('socket.io').Server

app.use(cors());
const server = require('http').createServer(app)
const io = new Server(server, {
    allowEIO3: true,
    cors: {
        origin: true,
        credentials: true
    },
})
const socketManage = require('./socketManage')(io)
const PORT = process.env.PORT || 8000
const path = require('path')


io.on('connection', socketManage )
server.listen( PORT, () => console.log('App was start at port : ' + PORT ))

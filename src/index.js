const express = require('express')
const cors = require('cors')
const natural = require('natural')
const app = express()
const Server = require('socket.io').Server
const PORT = process.env.PORT || 8000
app.use(cors());
// const server = require('http').createServer(app)




const server = app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

const socket_io = new Server(server, {
    allowEIO3: true,
    cors: {
        origin: "*",
    },
})
const socketManage = require('./socketManage')(socket_io)
socket_io.on('connection', socketManage)

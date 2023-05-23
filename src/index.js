const express = require('express')
const cors = require('cors')
const natural = require('natural')
const app = express()
const Server = require('socket.io').Server
const PORT = process.env.PORT || 8000
app.use(cors());
// const server = require('http').createServer(app)



// -----------------------------------------------------------------------------

app.get('/nature/:text', (req, res) => {
    const { text } = req.params
    try {
        if (!text) return res.status(400).json("Bad Request");
        const tokenizer = new natural.WordTokenizer();
        const textTokens = tokenizer.tokenize(text)
        const analyzer = new natural.SentimentAnalyzer("English", natural.PorterStemmer, "afinn");
        const comparative = analyzer.getSentiment(textTokens)
        const expression = comparative > 0 ? "positive" : comparative < 0 ? 'negitive' : 'neutral'
        res.status(200).json(expression);
    } catch (error) {
        res.status(500).json(error)
    }
});

// -----------------------------------------------------------------------------

const server = app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

const socket_io = new Server(server, {
    allowEIO3: true,
    cors: {
        origin: true,
        credentials: true
    },
})
const socketManage = require('./socketManage')(socket_io)
socket_io.on('connection', socketManage)

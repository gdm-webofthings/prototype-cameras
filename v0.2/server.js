const express = require('express')
const app = express()
const https = require('https')
const fsextra = require('fs-extra')
const { v4: uuidV4 } = require('uuid')
const port = 3000;
const httpsOptions = {
  key: fsextra.readFileSync('./security/cert.key'),
  cert: fsextra.readFileSync('./security/cert.pem')
}
const server = https.createServer(httpsOptions, app)
const io = require('socket.io')(server)

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(port, () => {
  console.log('server running at ' + port)
})
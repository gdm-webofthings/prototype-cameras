import express from "express";
const app = express();
import https from "https";
import * as fs from "fs";
import {
	v4 as uuidV4
} from 'uuid';
import * as ioTool from "socket.io";

const port = 3000;
const httpsOptions = {
	key: fs.readFileSync('./security/cert.key'),
	cert: fs.readFileSync('./security/cert.pem')
}
const server = https.createServer(httpsOptions, app)
const io = new ioTool.Server(server);

app.get('/', (req, res) => {
	res.redirect(`/${uuidV4()}`)
})

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/', (req, res) => {
	res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
	res.render('room', {
		roomId: req.params.room
	})
})

server.listen(port, () => {
	console.log('server running at ' + `https://localhost:${port}`);
})

io.on('connection', socket => {
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId);
		socket.to(roomId).emit('user-connected', userId)

		socket.on('disconnect', () => {
			socket.to(roomId).emit('user-disconnected', userId)
		})
	})
})
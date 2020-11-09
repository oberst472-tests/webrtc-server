const express = require('express')
const app = express()
const server = require('http').createServer(app)
const options = {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
};
const io = require('socket.io')(server, options);

app.get('/', (req, res) => {
    res.send('hello')
})

const rooms = {}

io.on('connection', socket => {
    console.log('socket connection!')
    socket.on('join-room', roomID => {
        console.log(roomID)
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id)
        } else {
            rooms[roomID] = [socket.id]
        }

        const otherUser = rooms[roomID].find(id => id !== socket.id)
        if (otherUser) {
            socket.emit('other user', otherUser)
            socket.to(otherUser).emit('user joined', socket.id)
        }


    })


    socket.on('offer', payload => {
        io.to(payload.target).emit('offer', payload)
    })

    socket.on('answer', payload => {
        io.to(payload.target).emit('answer', payload)
    })

    socket.on('ice-candidate', incoming => {
        io.to(incoming.target).emit('answer', incoming.candidate)
    })

})


server.listen(3000, () => {
    console.log('сервер стартанул на порту 3000')})

const app = require('express')()
const server = require('http').createServer(app)
const cors = require('cors')

const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

app.use(cors())

const PORT = process.env.PORT || 5000

app.get("/", (req, res) => {
    res.send('Server is running')
})

io.on('connection', (socket)=>{
    // Creating a room called 'me'
    socket.emit('me', socket.id)

    //On disconnecting from the frontend, we end the call
    socket.on('disconnect', () => {
        socket.broadcast.emit('callended')
    })

    //On calluser from frontend, we pass data from the frontend to here,and pass the collected data to userToCall and establish a connection request to the other user
    socket.on('calluser', ({userToCall, signalData, from, name}) => {
        io.to(userToCall).emit('calluser', {signal: signalData, from, name})
    })

    //On answercall, signal data and the id of the user who initiated the call is passed from front end to here and the connection between me and the other user is complete
    socket.on('answercall', (data) => {
        io.to(data.to).emit('callaccepted', data.signal)
    })
})

//Connecting to PORT
server.listen(PORT, () => console.log(`Server lisetning on PORT ${PORT}`))
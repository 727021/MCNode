const net = require('net')

const {Player} = require('./player')
const Settings = require('./settings')
const rl = require('readline').createInterface(process.stdin, process.stdout)

// Create the server
const server = net.createServer(socket => {
    console.log('Incoming connection from ', socket.remoteAddress)
    socket.setTimeout(Settings.afkTimeout * 60 * 1000)
    Player.all.push(new Player(socket))
})

server.on('error', err => {
    console.error(err)
})

server.on('close', () => {
    console.log('Server closed.')
})

// Accept console input
rl.on('line', line => {

})

exports.server = server
exports.rl = rl
const net = require('net')

// stdin/stdout can be changed once a GUI is implemented. I/O can be piped wherever they need to go.
const rl = require('readline').createInterface(process.stdin, process.stdout)

const { Level, LevelType } = require('./level')
const Player = require('./player')
const Settings = require('./settings')
const Command = require('./command')

// Create the server
const server = net.createServer(socket => {
    console.log(socket)
    socket.setTimeout(Settings.afkTimeout * 60 * 1000)
    new Player(socket)
})

server.on('error', err => {
    console.error(err)
})

server.on('close', () => {
    console.log('Server closed.')
})

server.listen(Settings.port, () => {
    console.log('Listening on port ' + Settings.port)
})

// Accept console input
rl.setPrompt('')
rl.on('line', line => {
    if (line[0] === '/') {
        let args = line.slice(1).split(' ')
        const command = args[0].toLowerCase()
        args = args.slice(1)
        const cmd = Command.all.find(c => c.consoleUsable && (c.name === command || c.aliases.some(a => a === command)))
        if (cmd) cmd.use(args)
        else console.log('Invalid command: /' + command)
    }
})

// Generate a dummy Level
const mainLevel = new Level('main', 32, 64, 32, LevelType.FLAT)

exports.server = server
exports.rl = rl
exports.mainLevel = mainLevel

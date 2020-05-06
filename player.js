const {v5: uuid} = require('uuid/')

exports.Player = class Player {
    static all = []

    constructor(socket) {
        // Initialize Player object
        this.s = socket
        this.id = uuid() // change this later
        socket.on('data', this.handleData)
        socket.on('end', this.handleEnd)
        socket.on('error', this.handleError)
        socket.on('timeout', this.handleTimeout)
        socket.on('close', err => {
            console.log('Connection closed:', socket.remoteAddress)

        })
    }

    handleData(buf) {

    }

    handleEnd() {

    }

    handleError(err) {

    }

    handleTimeout() {

    }



    kick(msg) {
        // Send kick packet

        this.s.end()
    }
}

exports.PlayerList = class PlayerList {
    constructor(players) {
        this.players = players || []
    }

    add(p) {
        if (!this.contains(p))
            this.players.push(p)
        return p
    }

    remove(p) {
        this.players = this.players.filter(pl => p.id === pl.id)
        return this
    }

    contains(p) {
        return this.players.some(pl => p.id === pl.id)
    }

    find(p) {
        return this.players.find(pl => p.id === pl.id)
    }

    findByName(name) {
        return this.players.find(pl => p.name === pl.name)
    }
}
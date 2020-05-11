const md5 = require('md5')
const { EventEmitter } = require('events')
const { Socket } = require('net')
const { gzip } = require('node-gzip')

const { Packet, Type } = require('./packet')
const Settings = require('./settings')
const { Level } = require('./level')
const Block = require('./block')
const Command = require('./command')

class Player extends EventEmitter {
    static all = []

    /**
     *
     * @param {Socket} socket
     */
    constructor(socket) {
        super()

        // Initialize Player object
        this.buffer = Buffer.alloc(0)
        this.tempbuffer = Buffer.alloc(0)
        this.disconnected = false

        this.name
        this.id
        this.userID = -1
        this.ip
        this.loading = true
        this.pos = { x: 0, y: 0, z: 0, rotx: 0, roty: 0 }
        this.loggedIn = false

        this.s = socket
        this.ip = socket.remoteAddress
        console.log(this.ip, 'connected to the server.')

        socket.on('data', this.handleData)
        socket.on('end', this.handleEnd)
        socket.on('error', this.handleError)
        socket.on('timeout', this.handleTimeout)
        socket.on('close', err => {
            Player.all = Player.all.filter(p => p.id !== this.id)
            console.log('Connection closed:', socket.remoteAddress)
        })
    }

    /**
     *
     * @param {Buffer} buf
     */
    handleData = buf => {
        console.log(buf)
        this.tempbuffer = Buffer.from(buf)
        if (this.disconnected) return console.log('Disconnected')
        if (this.tempbuffer.length === 0) return console.log('tempbuffer empty') // this.kick('Error')
        const b = Buffer.concat([ this.buffer, this.tempbuffer ])
        this.buffer = this.handleRaw(b)
    }

    handleEnd = () => {
        // if (this.disconnected) return
        // if (this.tempbuffer.length === 0) return this.kick('Error')
        // const b = Buffer.concat([ this.buffer, this.tempbuffer ], this.buffer.length + this.tempbuffer.length)
        // this.buffer = handleRaw(b)
    }

    handleError(err) {}

    handleTimeout() {}

    /**
     *
     * @param {Buffer} buf
     */
    handleRaw = buf => {
        try {
            const opcode = buf[0]
            const packet = Packet.getPacketType(opcode)
            if (buf.length >= packet.length) {
                const message = Buffer.alloc(packet.length - 1)
                buf.copy(message, 0, 1, packet.length)
                const tempbuffer = Buffer.alloc(buf.length - packet.length)
                buf.copy(tempbuffer, 0, packet.length, buf.length)
                const data = []
                let i = 0
                packet.types.forEach(t => {
                    switch (t) {
                        case Type.ARRAY:
                            data.push(message.slice(i, t.length))
                            break
                        case Type.BYTE:
                            data.push(message.readUInt8(i))
                            break
                        case Type.SBYTE:
                            data.push(message.readInt8(i))
                            break
                        case Type.SHORT:
                            data.push(message.readInt16BE(i))
                            break
                        case Type.STRING:
                            const s = b2s(message.slice(i, t.length))
                            console.log(s)
                            data.push(s.trimRight())
                            break
                    }
                    i += t.length
                })

                if (opcode !== 8) {
                    console.log('\nINCOMING PACKET')
                    console.log('OPCODE: ' + opcode)
                    console.log(data)
                    console.log()
                }

                switch (opcode) {
                    case Packet.OPCODES.IDENTIFICATION:
                        this.handleIdentification(data)
                        break
                    case Packet.OPCODES.SET_BLOCK_CLIENT:
                        this.handleSetBlock(data)
                        break
                    case Packet.OPCODES.POSITION_AND_ORIENTATION:
                        this.handlePositionOrientation(data)
                        break
                    case Packet.OPCODES.MESSAGE:
                        this.handleMessage(data)
                        break
                    default:
                        break
                }

                if (tempbuffer.length > 0) return this.handleRaw(tempbuffer)
                else return Buffer.alloc(0)
            }
        } catch (error) {
            console.error(error)
            return buf
        }
    }

    /**
     * Encode packet data as a byte array and send it to the client
     * @param {Packet} packet The type of packet to send
     * @param {Any[]} data The packet data to encode and send
     */
    sendPacket = (packet, data) => {
        if (data.length !== packet.types.length) {
            console.error('Invalid packet:')
            console.error(packet)
            console.error(data)
            return
        }
        console.log('\nOUTGOING PACKET:')
        console.log('OPCODE: ' + packet.opcode)
        console.log('DATA:')
        console.log(data)
        console.log()
        const buf = Buffer.alloc(packet.length)
        let offset = buf.writeUInt8(packet.opcode)
        for (let i = 0; i < packet.types.length; i++) {
            switch (packet.types[i]) {
                case Type.ARRAY:
                    Buffer.from(data[i]).copy(buf, offset)
                    offset += data[i].length
                    break
                case Type.BYTE:
                    offset = buf.writeUInt8(data[i], offset)
                    break
                case Type.SBYTE:
                    offset = buf.writeInt8(data[i], offset)
                    break
                case Type.SHORT:
                    offset = buf.writeInt16BE(data[i], offset)
                    break
                case Type.STRING:
                    let b = Buffer.alloc(64, 0x20)
                    Buffer.from(s2b(data[i])).copy(b)
                    b.copy(buf, offset)
                    offset += b.length
                    break
            }
        }
        this.sendRaw(buf)
    }

    /**
     * Send raw data to the client
     * @param {Buffer} buf The byte array to be sent
     */
    sendRaw = buf => {
        this.s.write(buf, err => {
            console.error(err)
        })
    }

    //#region Incoming Packets
    handleIdentification = data => {
        try {
            if (this.loggedIn) return

            const [ protocol, username, verify, unused ] = data
            this.name = username

            // TODO Check bans

            // TODO Check whitelist

            // TOD Check IP bans

            // TODO Check omnibans

            if (Player.all.length >= Settings.max) return this.kick('Server full')
            if (protocol !== Settings.protocol) return this.kick('Wrong protocol version')
            if (!/^[A-Za-z0-9_\.]{1,16}$/.test(this.name)) return this.kick('Illegal name')

            // Verify username
            // if (
            //     verify === '--' ||
            //     verify !== b2s(md5(s2b(Settings.salt + this.name))).replace(/\-/g, '').toLowerCase().replace(/^0+/, '')
            // )
            //     return this.kick('Login failed')

            // Kick duplicates
            Player.all.forEach(p => {
                if (p.name === this.name) p.kick('Someone logged in as you')
            })

            // Player is legit, finish login
            this.sendIdentification()
            this.level = Level.all.find(l => l.name === 'main')
            this.sendMap()
            this.loading = true

            if (this.disconnected) return

            this.loggedIn = true
            this.id = freeID()

            Player.all.push(this)

            this.deaths = 0
            this.sendMessage(`Welcome, ${this.name}!`)

            this.pos = {
                x: Math.floor((0.5 + this.level.spawn.x) * 32),
                y: Math.floor((1 + this.level.spawn.y) * 32),
                z: Math.floor((0.5 + this.level.spawn.z) * 32),
                rotx: this.level.spawn.rotx,
                roty: this.level.spawn.roty
            }

            try {
                Player.sendSpawnPlayer(this)
                Player.all.forEach(p => {
                    if (p.level === this.level && p.id !== this.id) this.sendSpawnPlayer(p)
                })
            } catch (error) {
                console.error(`Error spawning player '${this.name}':`)
                console.error(error)
            }
        } catch (error) {
            console.error(error)
        }
    }

    handleSetBlock = data => {}

    handlePositionOrientation = data => {}

    handleMessage = data => {}
    //#endregion

    //#region Outgoing packets
    sendIdentification = () => {
        const packet = Packet.IDENTIFICATION
        const data = [ Settings.protocol, Settings.name, Settings.motd, 0x00 ]

        this.sendPacket(packet, data)
    }

    sendMap = () => {
        // Initialize
        this.sendPacket(Packet.LEVEL_INITIALIZE, [])

        // Send chunks
        const packet = Packet.LEVEL_DATA_CHUNK
        const levelBuffer = Buffer.alloc(12 + this.level.blocks.length)
        let offset = levelBuffer.writeInt32BE(this.level.size.width)
        offset = levelBuffer.writeInt32BE(this.level.size.height, offset)
        offset = levelBuffer.writeInt32BE(this.level.size.depth, offset)
        Buffer.from(this.level.blocks).copy(levelBuffer, offset)
        gzip(levelBuffer).then(zipped => {
            const totalBytes = zipped.length
            offset = 0
            let done = false
            while (!done) {
                if (offset + 64 > totalBytes) {
                    // This is the last chunk, pad with 0x00 and send it
                    const zeroBuf = Buffer.alloc(64, 0x00)
                    levelBuffer.slice(offset).copy(zeroBuf)
                    this.sendPacket(packet, [ totalBytes - offset, zeroBuf, 100 ])
                    done = true
                } else {
                    // Not the last chunk, send and increase offset
                    this.sendPacket(packet, [
                        64,
                        levelBuffer.slice(offset, offset + 64),
                        Math.trunc((offset + 64) / totalBytes * 100)
                    ])
                    offset += 64
                }
            }

            // Finalize
            this.sendPacket(Packet.LEVEL_FINALIZE, [
                this.level.size.width,
                this.level.size.height,
                this.level.size.depth
            ])
        })
    }

    sendSpawnPlayer = p => {
        const packet = Packet.SPAWN_PLAYER
        const pos = encodePos(p.pos)
        const data = [ p.id === this.id ? -1 : p.id, p.name, p.pos.x, p.pos.y, p.pos.z, p.pos.rotx, p.pos.roty ]
        this.sendPacket(packet, data)
        this.sendTeleport(p)
    }

    sendTeleport = p => {
        this.sendPacket(Packet.PLAYER_TELEPORT, [
            p.id === this.id ? -1 : p.id,
            p.pos.x,
            p.pos.y,
            p.pos.z,
            p.pos.rotx,
            p.pos.roty
        ])
    }

    sendMessage = msg => {}
    //#endregion

    //#region Global outgoing
    static sendSpawnPlayer = p => {
        Player.all.forEach(pl => {
            pl.sendSpawnPlayer(p)
        })
    }
    //#endregion

    kick = msg => {
        // Send kick packet
        this.sendPacket(Packet.DISCONNECT_PLAYER, [ msg ])
    }
}

module.exports = Player

//#region Helper functions

/**
 * Convert a string to an array of bytes
 * @param {String} s The string to convert
 * @returns {Number[]} Array of ASCII codes
 */
function s2b(s) {
    return s.split('').map(c => c.charCodeAt(0))
}

/**
 * Convert an array of bytes to a string
 * @param {Number[]} b The byte array to convert
 * @returns {String} ASCII string
 */
function b2s(b) {
    let s = ''
    for (let i = 0; i < b.length; i++) {
        s += String.fromCharCode(b[i])
    }
    return s
}

/**
 * Find the lowest unused player id
 * @returns {Number} Player ID (0-255)
 */
function freeID() {
    for (let b = 0; b < 255; b++) {
        if (!Player.all.some(p => p.id === b)) return b
    }
    return 0
}

/**
 * Encode a player position to be sent in a packet
 * @param {Object} pos The position to convert
 * @param {Number} [pos.x]
 * @param {Number} [pos.y]
 * @param {Number} [pos.z]
 * @param {Number} [pos.rotx]
 * @param {Number} [pos.roty]
 * @returns {Object} The encoded position, containing only fields that were supplied in the input
 */
function encodePos(pos) {
    const out = { ...pos }
    if (isDefined(out.x)) out.x = Math.trunc(out.x * 32)
    if (isDefined(out.y)) out.y = Math.trunc(out.y * 32)
    if (isDefined(out.z)) out.z = Math.trunc(out.z * 32)
    if (isDefined(out.rotx)) out.rotx = Math.trunc(out.rotx / 360.0 * 256)
    if (isDefined(out.roty)) out.roty = Math.trunc(out.roty / 360.0 * 256)
}

/**
 * Decode a player position received in a packet
 * @param {Object} pos The position to convert
 * @param {Number} [pos.x]
 * @param {Number} [pos.y]
 * @param {Number} [pos.z]
 * @param {Number} [pos.rotx]
 * @param {Number} [pos.roty]
 * @returns {Object} The decoded position, containing only fields that were supplied in the input
 */
function decodePos(pos) {
    const out = { ...pos }
    if (isDefined(out.x)) out.x = out.x / 32.0
    if (isDefined(out.y)) out.y = out.y / 32.0
    if (isDefined(out.z)) out.z = out.z / 32.0
    if (isDefined(out.rotx)) out.rotx = Math.trunc(out.rotx / 256.0 * 360)
    if (isDefined(out.roty)) out.roty = Math.trunc(out.roty / 256.0 * 360)
}

/**
 * Determines whether a variable is defined
 * @param {Any} v The variable to check
 * @returns {Boolean}
 */
function isDefined(v) {
    return !(typeof v === 'undefined' || v === null)
}

//#endregion

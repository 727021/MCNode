class Type {
    /** Single byte integer (0 to 255) */
    static BYTE = new Type(1)
    /** Single byte signed integer (-128 to 127) */
    static SBYTE = new Type(1)
    /** Signed integer (-32768 to 32767) */
    static SHORT = new Type(2)
    /** US-ASCII/ISO646-US encoded string padded with spaces (0x20) */
    static STRING = new Type(64)
    /** Binary data padded with null bytes (0x00) */
    static ARRAY = new Type(64)

    constructor(i) {
        this.length = i
    }
}

class Direction {
    /** Client-to-Server packets */
    static C2S = new Direction()
    /** Client-to-Server packets */
    static CLIENT_TO_SERVER = Direction.C2S
    /** Server-to-Client packets */
    static S2C = new Direction()
    /** Server-to-Client packets */
    static SERVER_TO_CLIENT = Direction.S2C
}

class Packet {
    static OPCODES = {
        IDENTIFICATION: 0x00,
        PING: 0x01,
        LEVEL_INITIALIZE: 0x02,
        LEVEL_DATA_CHUNK: 0x03,
        LEVEL_FINALIZE: 0x04,
        SET_BLOCK_CLIENT: 0x05,
        SET_BLOCK_SERVER: 0x06,
        SPAWN_PLAYER: 0x07,
        POSITION_AND_ORIENTATION: 0x08,
        POSITION_AND_ORIENTATION_UPDATE: 0x09,
        POSITION_UPDATE: 0x0a,
        ORIENTATION_UPDATE: 0x0b,
        DESPAWN_PLAYER: 0x0c,
        MESSAGE: 0x0d,
        DISCONNECT_PLAYER: 0x0e,
        UPDATE_USER_TYPE: 0x0d,
        NULL: null
    }

    //#region Vanilla Packets

    /**
     * Null packet
     */
    static NULL = new Packet(null, null, [])
    /**
     * Player Identification (C2S):
     *
     * Sent by a player joining a server with relevant information.
     *
     *     - Protocol Version - Byte (0x07)
     *     - Username         - String
     *     - Verification Key - String (md5(username + salt))
     *     - Unused           - Byte (0x00)
     *
     * Server Identification (S2C):
     *
     * Response to a joining player.
     *
     *     - Protocol Version - Byte (0x07)
     *     - Server Name      - String
     *     - Server MOTD      - String
     *     - User Type        - String (whether player is an op (0x64) or not (0x00))
     */
    static IDENTIFICATION = new Packet(Packet.OPCODES.IDENTIFICATION, Direction.C2S | Direction.S2C, [
        Type.BYTE,
        Type.STRING,
        Type.STRING,
        Type.BYTE
    ])
    /**
     * Ping:
     *
     * Sent to clients periodically.
     * The only way a client can disconnect at the moment is to force it closed,
     * which does not let the server know.
     * The ping packet is used to determine if the connection is still open.
     */
    static PING = new Packet(Packet.OPCODES.PING, Direction.S2C, [])
    /**
     * Level Initialize:
     *
     * Notifies player of incoming level data.
     */
    static LEVEL_INITIALIZE = new Packet(Packet.OPCODES.LEVEL_INITIALIZE, Direction.S2C, [])
    /**
     * Level Data Chunk:
     *
     * Contains a chunk of gzipped map (not level.dat file).
     * The decompression must be done on the all the chunks sent in Level Data Chunk
     * packets together, not independently.
     * After decompression the map consists of a big-endian int(4 bytes)
     * containing the number of blocks, followed by a raw map array.
     * (chunk is up to 1024 bytes, padded with 0x00s if less).
     *
     *     - Chunk Length     - Short
     *     - Chunk Data       - Byte Array
     *     - Percent Complete - Byte
     */
    static LEVEL_DATA_CHUNK = new Packet(Packet.OPCODES.LEVEL_DATA_CHUNK, Direction.S2C, [
        Type.SHORT,
        Type.ARRAY,
        Type.BYTE
    ])
    /**
     * Level Finalize:
     *
     * Sent after level data is complete and gives map dimensions.
     * The y coordinate is how tall the map is.
     *
     *     - X Size - Short
     *     - Y Size - Short
     *     - Z Size - Short
     */
    static LEVEL_FINALIZE = new Packet(Packet.OPCODES.LEVEL_FINALIZE, Direction.S2C, [
        Type.SHORT,
        Type.SHORT,
        Type.SHORT
    ])
    /**
     * Set Block (C2S):
     *
     * Sent when a user changes a block.
     *
     * Client assumes that this command packet always succeeds, and so draws the
     * new block immediately. To disallow block creation, server must send back Set Block
     * packet with the old block type.
     *
     * The XYZ coordinates of the block are just shorts representing the coordinate of the
     * block (as opposed to player coordinates where the lower 5 bits are fractional coordinates)
     *
     *     - X          - Short
     *     - Y          - Short
     *     - Z          - Short
     *     - Mode       - Byte (created (0x01) or destroyed (0x00))
     *     - Block Type - Byte (type the player is holding)
     */
    static SET_BLOCK_CLIENT = new Packet(Packet.OPCODES.SET_BLOCK_CLIENT, Direction.C2S, [
        Type.SHORT,
        Type.SHORT,
        Type.SHORT,
        Type.BYTE,
        Type.BYTE
    ])
    /**
     * Set Block (S2C):
     *
     * Sent to indicate a block change by physics or by players.
     * In the case of a player change, the server will also echo the block change back to
     * the player who initiated it.
     *
     *     - X          - Short
     *     - Y          - Short
     *     - Z          - Short
     *     - Block Type - Byte
     */
    static SET_BLOCK_SERVER = new Packet(Packet.OPCODES.SET_BLOCK_SERVER, Direction.S2C, [
        Type.SHORT,
        Type.SHORT,
        Type.SHORT,
        Type.BYTE
    ])
    /**
     * Spawn Player:
     *
     * Sent to indicate where a new player is spawning in the world.
     *
     * Player coordinates are fixed-point values with the lowest 5 bits representing the
     * fractional position (i.e. divide by 32 to get actual position in terms of block
     * coordinates).
     *
     * The angle parameters are scaled such that a value of 256 would correspond to 360 degrees.
     *
     * PlayerID -1 (255 unsigned) indicates the player's self.
     * This will set the player's spawn point.
     *
     *     - Player ID    - SByte
     *     - Player Name  - String
     *     - X            - Short
     *     - Y            - Short
     *     - Z            - Short
     *     - Yaw (rotx)   - Byte
     *     - Pitch (roty) - Byte
     */
    static SPAWN_PLAYER = new Packet(Packet.OPCODES.SPAWN_PLAYER, Direction.S2C, [
        Type.SBYTE,
        Type.STRING,
        Type.SHORT,
        Type.SHORT,
        Type.SHORT,
        Type.BYTE,
        Type.BYTE
    ])
    /**
     * Position and Orientation (C2S):
     *
     * Sent frequently (even while not moving) by the player with the player's current
     * location and orientation.
     *
     * Player ID is always 255, referring to itself.
     *
     * Player coordinates are fixed-point values with the lowest 5 bits representing the
     * fractional position (i.e. divide by 32 to get actual position in terms of block
     * coordinates).
     *
     * The angle parameters are scaled such that a value of 256 would correspond to 360 degrees.
     *
     *     - Player ID    - Byte
     *     - X            - Short
     *     - Y            - Short
     *     - Z            - Short
     *     - Yaw (rotx)   - Byte
     *     - Pitch (roty) - Byte
     */
    static POSITION_AND_ORIENTATION = new Packet(Packet.OPCODES.POSITION_AND_ORIENTATION, Direction.C2S, [
        Type.BYTE,
        Type.SHORT,
        Type.SHORT,
        Type.SHORT,
        Type.BYTE,
        Type.BYTE
    ])
    /**
     * Player Teleport (S2C):
     *
     * Sent with changes in player position and rotation.
     * Teleports player it's sent to if player ID < 0 (For sending initial position in map,
     * and /tp)
     *
     * Player coordinates are fixed-point values with the lowest 5 bits representing the
     * fractional position (i.e. divide by 32 to get actual position in terms of block
     * coordinates).
     *
     * The angle parameters are scaled such that a value of 256 would correspond to 360 degrees.
     *
     *     - Player ID    - SByte
     *     - X            - Short
     *     - Y            - Short
     *     - Z            - Short
     *     - Yaw (rotx)   - BYte
     *     - Pitch (roty) - Byte
     */
    static PLAYER_TELEPORT = new Packet(Packet.OPCODES.PLAYER_TELEPORT, Direction.S2C, [
        Type.SBYTE,
        Type.SHORT,
        Type.SHORT,
        Type.SHORT,
        Type.BYTE,
        Type.BYTE
    ])
    /**
     * Position and Orientation Update:
     *
     * Not required for server operation.
     */
    static POSITION_AND_ORIENTATION_UPDATE = new Packet(Packet.OPCODES.POSITION_AND_ORIENTATION_UPDATE, Direction.S2C, [
        Type.SBYTE,
        Type.SBYTE,
        Type.SBYTE,
        Type.SBYTE,
        Type.BYTE,
        Type.BYTE
    ])
    /**
     * Position Update:
     *
     * Not required for server operation.
     */
    static POSITION_UPDATE = new Packet(Packet.OPCODES.POSITION_UPDATE, Direction.S2C, [
        Type.SBYTE,
        Type.SBYTE,
        Type.SBYTE,
        Type.SBYTE
    ])
    /**
     * Orientation Update:
     *
     * Not required for server operation.
     */
    static ORIENTATION_UPDATE = new Packet(Packet.OPCODES.ORIENTATION_UPDATE, Direction.S2C, [
        Type.SBYTE,
        Type.BYTE,
        Type.BYTE
    ])
    /**
     * Despawn Player:
     *
     * Sent when a player disconnects.
     *
     *     - Player ID - SByte
     */
    static DESPAWN_PLAYER = new Packet(Packet.OPCODES.DESPAWN_PLAYER, Direction.S2C, [ Type.SBYTE ])
    /**
     * Message (C2S):
     *
     * Contain chat messages sent by player.
     *
     *     - Unused  - Byte (0xFF)
     *     - Message - String
     *
     * Message (S2C):
     *
     * Messages sent by chat or from the console.
     *
     *     - Player ID - SByte
     *     - Message   - String
     */
    static MESSAGE = new Packet(Packet.OPCODES.MESSAGE, Direction.C2S | Direction.S2C, [ Type.BYTE, Type.STRING ])
    /**
     * Disconnect Player:
     *
     * Sent to a player when they're disconnected from the server.
     *
     *     - Disconnect Reason - String
     */
    static DISCONNECT_PLAYER = new Packet(Packet.OPCODES.DISCONNECT_PLAYER, Direction.S2C, [ Type.STRING ])
    /**
     * Update User Type:
     *
     * Sent when a player is opped/deopped.
     *
     * User type is 0x64 for op, 0x00 for normal user.
     *
     *     - User Type - Byte
     */
    static UPDATE_USER_TYPE = new Packet(Packet.OPCODES.UPDATE_USER_TYPE, Direction.S2C, [ Type.BYTE ])
    //#endregion

    //#region CPE Packets

    //#endregion

    /**
     * @param {Number} opcode
     * @param {Direction} direction
     * @param {Type[]} types
     */
    constructor(opcode, direction, types) {
        this.opcode = opcode
        this.direction = direction
        this.types = types
        this.length = 1
        for (const t of types) this.length += t.length
    }

    /**
     * Get packet type by opcode
     * @param {Number} opcode
     * @returns {Packet}
     */
    static getPacketType(opcode) {
        switch (opcode) {
            case Packet.OPCODES.IDENTIFICATION:
                return Packet.IDENTIFICATION
            case Packet.OPCODES.PING:
                return Packet.PING
            case Packet.OPCODES.LEVEL_INITIALIZE:
                return Packet.LEVEL_INITIALIZE
            case Packet.OPCODES.LEVEL_DATA_CHUNK:
                return Packet.LEVEL_DATA_CHUNK
            case Packet.OPCODES.LEVEL_FINALIZE:
                return Packet.LEVEL_FINALIZE
            case Packet.OPCODES.SET_BLOCK_CLIENT:
                return Packet.SET_BLOCK_CLIENT
            case Packet.OPCODES.SET_BLOCK_SERVER:
                return Packet.SET_BLOCK_SERVER
            case Packet.OPCODES.SPAWN_PLAYER:
                return Packet.SPAWN_PLAYER
            case Packet.OPCODES.POSITION_AND_ORIENTATION:
                return Packet.POSITION_AND_ORIENTATION
            case Packet.OPCODES.POSITION_AND_ORIENTATION_UPDATE:
                return Packet.POSITION_AND_ORIENTATION_UPDATE
            case Packet.OPCODES.POSITION_UPDATE:
                return Packet.POSITION_UPDATE
            case Packet.OPCODES.ORIENTATION_UPDATE:
                return Packet.ORIENTATION_UPDATE
            case Packet.OPCODES.DESPAWN_PLAYER:
                return Packet.DESPAWN_PLAYER
            case Packet.OPCODES.MESSAGE:
                return Packet.MESSAGE
            case Packet.OPCODES.DISCONNECT_PLAYER:
                return Packet.DISCONNECT_PLAYER
            case Packet.OPCODES.UPDATE_USER_TYPE:
                return Packet.UPDATE_USER_TYPE
            default:
                return Packet.NULL
        }
    }
}

module.exports = {
    Type: Type,
    Direction: Direction,
    Packet: Packet
}

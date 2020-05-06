class Type {
	/** Single byte integer (0 to 255) */
	static BYTE = new Type(1);
	/** Single byte signed integer (-128 to 127) */
	static SBYTE = new Type(1);
	/** Signed integer (-32768 to 32767) */
	static SHORT = new Type(2);
	/** US-ASCII/ISO646-US encoded string padded with spaces (0x20) */
	static STRING = new Type(64);
	/** Binary data padded with null bytes (0x00) */
	static ARRAY = new Type(64);

	constructor(i) {
		this.length = i;
	}
}

class Direction {
	/** Client-to-Server packets */
	static C2S = new Direction();
	/** Client-to-Server packets */
	static CLIENT_TO_SERVER = Direction.C2S;
	/** Server-to-Client packets */
	static S2C = new Direction();
	/** Server-to-Client packets */
	static SERVER_TO_CLIENT = Direction.S2C;
}

class Packet {
	//#region Vanilla Packets
	static IDENTIFICATION = new Packet(0x00, Direction.C2S | Direction.S2C, [
		Type.BYTE,
		Type.STRING,
		Type.STRING,
		Type.BYTE
	]);
	static PING = new Packet(0x01, Direction.S2C, []);
	static LEVEL_INITIALIZE = new Packet(0x02, Direction.S2C, []);
	static LEVEL_DATA_CHUNK = new Packet(0x03, Direction.S2C, [ Type.SHORT, Type.ARRAY, Type.BYTE ]);
	static LEVEL_FINALIZE = new Packet(0x04, Direction.S2C, [ Type.SHORT, Type.SHORT, Type.SHORT ]);
	static SET_BLOCK_CLIENT = new Packet(0x05, Direction.C2S, [
		Type.SHORT,
		Type.SHORT,
		Type.SHORT,
		Type.BYTE,
		Type.BYTE
	]);
	static SET_BLOCK_SERVER = new Packet(0x06, Direction.S2C, [ Type.SHORT, Type.SHORT, Type.SHORT, Type.BYTE ]);
	static SPAWN_PLAYER = new Packet(0x07, Direction.S2C, [
		Type.SBYTE,
		Type.STRING,
		Type.SHORT,
		Type.SHORT,
		Type.SHORT,
		Type.BYTE,
		Type.BYTE
	]);
	static POSITION_AND_ORIENTATION = new Packet(0x08, Direction.C2S, [
		Type.BYTE,
		Type.SHORT,
		Type.SHORT,
		Type.SHORT,
		Type.BYTE,
		Type.BYTE
	]);
	static PLAYER_TELEPORT = new Packet(0x08, Direction.S2C, [
		Type.SBYTE,
		Type.SHORT,
		Type.SHORT,
		Type.SHORT,
		Type.BYTE,
		Type.BYTE
	]);
	static POSITION_AND_ORIENTATION_UPDATE = new Packet(0x09, Direction.S2C, [
		Type.SBYTE,
		Type.SBYTE,
		Type.SBYTE,
		Type.SBYTE,
		Type.BYTE,
		Type.BYTE
	]);
	static POSITION_UPDATE = new Packet(0x0a, Direction.S2C, [ Type.SBYTE, Type.SBYTE, Type.SBYTE, Type.SBYTE ]);
	static ORIENTATION_UPDATE = new Packet(0x0b, Direction.S2C, [ Type.SBYTE, Type.BYTE, Type.BYTE ]);
	static DESPAWN_PLAYER = new Packet(0x0c, Direction.S2C, [ Type.SBYTE ]);
	static MESSAGE = new Packet(0x0d, Direction.C2S | Direction.S2C, [ Type.BYTE, Type.STRING ]);
	static DISCONNECT_PLAYER = new Packet(0x0e, Direction.S2C, [ Type.STRING ]);
	static UPDATE_USER_TYPE = new Packet(0x0f, Direction.S2C, [ Type.BYTE ]);
	//#endregion

	//#region CPE Packets

	//#endregion

	/**
     * @param {Number} opcode
     * @param {Direction} direction
     * @param {Type} types
     */
	constructor(opcode, direction, types) {
		this.opcode = opcode;
		this.direction = direction;
		this.types = types;
		this.length = 1;
		for (const t of types) this.length += t.length;
	}
}

module.exports = {
	Type: Type,
	Direction: Direction,
	Packet: Packet
};

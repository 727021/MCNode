const { version } = require('./package.json')

module.exports = class Settings {
	static protocol = 7 // Protocol version
	static salt = '' // 16-character base-62 salt used for heartbeats/authentication
	static version = version // Server version (taken from package.json)

	static port = 25565
	static name = '[MCNode Default]'
	static motd = 'Welcome to my server!'
	static public = true
	static max = 16 // Max number of users

    static afkTimeout = 15 // Minutes

	static load() {}

	static save() {}
}

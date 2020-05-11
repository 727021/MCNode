const Player = require('./player')

/**
 * @callback commandUse
 * @param {String[]} args Command arguments
 * @param {Player} [p] The player using the command, or console if omitted
 * @returns {Void}
 */

/**
 * @callback commandHelp
 * @param {Player} [p] The player using the command, or console if omitted
 * @returns {Void}
 */

class CommandCategory {
    static all = new Array()

    static CHAT = new CommandCategory('chat')
    static OTHER = new CommandCategory('other')
    static INFO = new CommandCategory('info')

    constructor(name) {
        this.name = name
        CommandCategory.all.push(this)
    }
}

class Command {
    /**
     * An array of all defined commands
     */
    static all = new Array()

    /**
     * Define a new command
     * @param {String} name The name of the command
     * @param {String[]} aliases Aliases/shortcuts for the command name
     * @param {CommandCategory} category The category the command fits into
     * @param {commandUse} use The function called when the command is used
     * @param {commandHelp} help The function called when '/help command' is used
     * @param {Boolean} [consoleUsable=true] Whether the command can be used from the console
     */
    constructor(name, aliases, category, use, help, consoleUsable) {
        this.name = name
        this.aliases = [ ...aliases ]
        this.category = category
        this.use = use
        this.help = p => {
            sendChat(`Help for /${this.name}:`)
            help(p)
            if (this.aliases.length > 0) sendChat(`Aliases: ${this.aliases.join(', ')}`)
        }
        this.consoleUsable = typeof consoleUsable === 'undefined' || consoleUsable === null || consoleUsable

        Command.all.push(this)
    }
}

module.exports = Command

/**
 * Send a chat message to a player or the console
 * @param {String} msg The message to send
 * @param {Player} [p] The player to send the message to, or console if omitted
 */
function sendChat(msg, p) {
    if (typeof p === 'undefined' || p === null) console.log(msg)
    else;
    // p.sendMessage(msg)
}

//#region Commands

const CmdSay = new Command(
    'say',
    [ 's' ],
    CommandCategory.CHAT,
    (args, p) => {
        sendChat(`${typeof p === 'undefined' || p === null ? 'Console' : p.name} said '${args.join(' ')}'`)
    },
    p => {
        sendChat('/say [message] - Broadcast a message')
    }
)

const CmdHelp = new Command(
    'help',
    [ 'h', '?' ],
    CommandCategory.INFO,
    (args, p) => {
        if (args.length > 0) {
            if (
                Command.all.some(
                    c => c.name === args[0].toLowerCase() || c.aliases.some(a => a === args[0].toLowerCase())
                )
            ) {
                const cmd = Command.all.find(
                    c => c.name === args[0].toLowerCase() || c.aliases.some(a => a === args[0].toLowerCase())
                )
                cmd.help(p)
                return
            } else if (CommandCategory.all.some(c => c.name === args[0].toLowerCase())) {
                sendChat(`${args[0][0].toUpperCase()}${args[0].slice(1).toLowerCase()} commands:`)
                const cmds = Command.all.filter(
                    c =>
                        c.category.name === args[0].toLowerCase() &&
                        (c.consoleUsable || (typeof p !== 'undefined' && p !== null))
                )
                sendChat(cmds.length === 0 ? 'No commands found' : cmds.map(c => c.name).join(', '))
                return
            }
        }
        sendChat('/help [command/alias] - Get help with a specific command')
        CommandCategory.all.forEach(c => {
            sendChat(`/help ${c.name} - List all '${c.name}' commands`)
        })
    },
    p => {
        sendChat('/help [command/alias] - Get help with a specific command')
        CommandCategory.all.forEach(c => {
            sendChat(`/help ${c.name} - List all '${c.name}' commands`)
        })
    }
)

//#endregion

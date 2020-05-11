class Block {
    static all = new Array()

    static AIR = new Block(0x00, 'air', { walkthrough: true, light: true })
    static STONE = new Block(0x01, 'stone')
    static GRASS = new Block(0x02, 'grass')
    static DIRT = new Block(0x03, 'dirt')
    static COBBLESTONE = new Block(0x04, 'cobblestone')
    static PLANKS = new Block(0x05, 'planks', { flammable: true })
    static SAPLING = new Block(0x06, 'sapling', { walkthrough: true, flammable: true, washable: true })
    static BEDROCK = new Block(0x07, 'bedrock')
    static FLOWING_WATER = new Block(0x08, 'flowing_water', { walkthrough: true, light: true })
    static STILL_WATER = new Block(0x09, 'still_water', { walkthrough: true, light: true })
    static FLOWING_LAVA = new Block(0x0a, 'flowing_lava', {
        walkthrough: true,
        deadly: true,
        deathMessage: '{{player.name}} tried to swim in lava.'
    })
    static STILL_LAVA = new Block(0x0b, 'stil_lava', {
        walkthrough: true,
        deadly: true,
        deathMessage: '{{player.name}} tried to swim in lava.'
    })
    static SAND = new Block(0x0c, 'sand')
    static GRAVEL = new Block(0x0d, 'gravel')
    static GOLD_ORE = new Block(0x0e, 'gold_ore')
    static IRON_ORE = new Block(0x0f, 'iron_ore')
    static COAL_ORE = new Block(0x10, 'coal_ore')
    static WOOD = new Block(0x11, 'wood', { flammable: true })
    static LEAVES = new Block(0x12, 'leaves', { flammable: true, light: true })
    static SPONGE = new Block(0x13, 'sponge')
    static GLASS = new Block(0x14, 'glass', { light: true })
    static RED = new Block(0x15, 'red', { flammable: true })
    static ORANGE = new Block(0x16, 'orange', { flammable: true })
    static YELLOW = new Block(0x17, 'yellow', { flammable: true })
    static LIME = new Block(0x18, 'lime', { flammable: true })
    static GREEN = new Block(0x19, 'green', { flammable: true })
    static AQUA = new Block(0x1a, 'aqua', { flammable: true })
    static CYAN = new Block(0x1b, 'cyan', { flammable: true })
    static LIGHT_BLUE = new Block(0x1c, 'light_blue', { flammable: true })
    static BLUE = new Block(0x1d, 'blue', { flammable: true })
    static PURPLE = new Block(0x1e, 'purple', { flammable: true })
    static LIGHT_PURPLE = new Block(0x1f, 'light_purple', { flammable: true })
    static MAGENTA = new Block(0x20, 'magenta', { flammable: true })
    static PINK = new Block(0x21, 'pink', { flammable: true })
    static BLACK = new Block(0x22, 'black', { flammable: true })
    static GRAY = new Block(0x23, 'gray', { flammable: true })
    static WHITE = new Block(0x24, 'white', { flammable: true })
    static DANDELION = new Block(0x25, 'dandelion', { light: true, flammable: true, washable: true, walkthrough: true })
    static ROSE = new Block(0x26, 'rose', { light: true, flammable: true, washable: true, walkthrough: true })
    static BROWN_MUSHROOM = new Block(0x27, 'brown_mushroom', {
        light: true,
        flammable: true,
        washable: true,
        walkthrough: true
    })
    static RED_MUSHROOM = new Block(0x28, 'red_mushroom', {
        light: true,
        flammable: true,
        washable: true,
        walkthrough: true
    })
    static GOLD = new Block(0x29, 'gold')
    static IRON = new Block(0x2a, 'iron')
    static DOUBLE_SLAB = new Block(0x2b, 'double_slab')
    static SLAB = new Block(0x2c, 'slab')
    static BRICKS = new Block(0x2d, 'bricks')
    static TNT = new Block(0x2e, 'tnt', { flammable: true })
    static BOOKSHELF = new Block(0x2f, 'bookshelf', { flammable: true })
    static MOSSY_COBBLESTONE = new Block(0x30, 'mossy_cobblestone')
    static OBSIDIAN = new Block(0x31, 'obsidian')

    /**
     * Initialize a new block
     * @param {Number} id The byte id of the block
     * @param {String} name The name of the block
     * @param {Object} [options] Additional block information
     * @param {Boolean} [options.walkthrough=false] Whether players can walk through the block
     * @param {Boolean} [options.flammable=false] Whether will block should be destroyed by lava
     * @param {Boolean} [options.washable=false] Whether will block should be destroyed by water
     * @param {Boolean} [options.light=false] Whether light can pass through a block
     * @param {Boolean} [options.deadly=false] Whether this block will kill a player
     * @param {String} [options.deathMessage] The message to broadcase when the block kills a player.
     *     The following placeholders are available:
     *
     *     {{player.name}} - The name of the killed player
     *
     *     {{block}} - The name of the block that killed the player
     *
     *     {{player.level}} - The name of the level the player is on
     *
     *     {{player.position}} - The coordinates where the player died
     *
     *     {{player.deaths}} - The player's death count since logging in
     * @param {Block} [options.fallback=null] Fallback for extended blocks
     * @param {Block} [options.showAs=null] What to display the block as (for physics blocks)
     */
    constructor(id, name, options) {
        this.id = id
        this.name = name

        if (!options) options = {}
        this.walkthrough = Boolean(options.walkthrough)
        this.flammable = Boolean(options.flammable)
        this.washable = Boolean(options.washable)
        this.light = Boolean(options.light)
        this.deadly = Boolean(options.deadly)
        this.deathMessage = this.deadly ? options.deathMessage || '{{player.name}} was killed by {{block}}!' : ''
        this.fallback = options.fallback || null
        this.showAs = options.showAs || null

        Block.all.push(this)
    }

    toString() {
        return this.name
    }
}

module.exports = Block

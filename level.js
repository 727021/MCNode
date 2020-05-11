const Block = require('./block')

class LevelType {
    static i = 0
    static all = []
    static FLAT = new LevelType()

    constructor() {
        this.id = ++LevelType.i
        LevelType.all.push(this)
    }
}

class Level {
    static all = []

    /**
     * Create a new level
     * @param {String} name What to name the level
     * @param {Number} x Width
     * @param {Number} y Height
     * @param {Number} z Depth
     * @param {LevelType} type What type of level to create
     */
    constructor(name, x, y, z, type) {
        // Minimum dimensions are 16x16x16
        ;[ x, y, z ] = [ x, y, z ].map(i => (i < 16 ? 16 : i))

        this.name = name
        this.size = { width: x, height: y, depth: z }

        // Initialize block array
        this.blocks = new Array(x * y * z)
        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i] = Block.AIR
        }

        const half = Math.floor(y / 2)

        switch (type) {
            case LevelType.FLAT:
            default:
                for (x = 0; x < this.size.width; x++) {
                    for (y = 0; y < this.size.height; y++) {
                        for (z = 0; z < this.size.depth; z++) {
                            if (y === half) this.setBlock(x, y, z, Block.GRASS)
                            else this.setBlock(x, y, z, y < half ? Block.DIRT : Block.AIR)
                        }
                    }
                }
                break
        }

        this.spawn = {
            x: Math.floor(this.size.width / 2),
            y: Math.floor(this.size.height * 0.75),
            z: Math.floor(this.size.depth / 2),
            rotx: 0,
            roty: 0
        }

        Level.all.push(this)
    }

    /**
     * Get the block at { x, y, z }
     * @param {Number} x (0 - width-1)
     * @param {Number} y (0 - height-1)
     * @param {Number} z (0 - depth-1)
     * @returns {Block}
     */
    getBlock = (x, y, z) => {
        if (x >= this.size.width || y >= this.size.height || z >= this.size.depth || [ x, y, z ].some(i => i < 0))
            return Block.AIR
        return this.blocks[this.pos2int(x, y, z)]
    }

    /**
     * Set the block at { x, y, z }
     * @param {Number} x (0 - width-1)
     * @param {Number} y (0 - height-1)
     * @param {Number} z (0 - depth-1)
     * @param {Block} block The block to set
     */
    setBlock = (x, y, z, block) => {
        if (
            x >= this.size.width ||
            y >= this.size.height ||
            z >= this.size.depth ||
            [ x, y, z ].some(i => i < 0) ||
            !Block.all.some(b => b === block)
        )
            return
        this.blocks[this.pos2int(x, y, z)] = block
    }

    int2pos = b => {
        if (b > this.blocks.length) return { x: 0, y: 0, z: 0 }
        return {
            x: b % this.size.width,
            y: (b / thissize.width) % this.size.height,
            z: Math.trunc(b / (this.size.width * this.size.heigt))
        }
    }

    pos2int = (x, y, z) => {
        if (x >= this.size.width) x = this.size.width - 1
        if (x < 0) x = 0
        if (y >= this.size.height) y = this.size.height - 1
        if (y < 0) y = 0
        if (z >= this.size.depth) z = this.size.depth - 1
        if (z < 0) z = 0
        return x + this.size.width * y + this.size.width * this.size.height * z
    }
}

module.exports = {
    Level,
    LevelType
}

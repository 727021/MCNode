class Color {
    static BLACK = new Color(0x0, 'black', { r: 0, g: 0, b: 0 })
    static NAVY = new Color(0x1, 'navy', { r: 0, g: 0, b: 191 })
    static GREEN = new Color(0x2, 'green', { r: 0, g: 191, b: 0 })
    static TEAL = new Color(0x3, 'teal', { r: 0, g: 191, b: 191 })
    static MAROON = new Color(0x4, 'maroon', { r: 191, g: 0, b: 0 })
    static PURPLE = new Color(0x5, 'purple', { r: 191, g: 0, b: 181 })
    static GOLD = new Color(0x6, 'gold', { r: 191, g: 191, b: 0 })
    static SILVER = new Color(0x7, 'silver', { r: 191, g: 191, b: 191 })
    static GRAY = new Color(0x8, 'gray', { r: 64, g: 64, b: 64 })
    static BLUE = new Color(0x9, 'blue', { r: 64, g: 64, b: 255 })
    static LIME = new Color(0xa, 'lime', { r: 64, g: 255, b: 64 })
    static AQUA = new Color(0xb, 'aqua', { r: 64, g: 255, b: 255 })
    static RED = new Color(0xc, 'red', { r: 255, g: 64, b: 64 })
    static PINK = new Color(0xd, 'pink', { r: 255, g: 64, b: 255 })
    static YELLOW = new Color(0xe, 'yellow', { r: 255, g: 255, b: 64 })
    static WHITE = new Color(0xf, 'white', { r: 255, g: 255, b: 255 })

    /**
     * @param {Number} id The color's id (color code)
     * @param {String} name The color's name
     * @param {Object} rgb The color's RGB value as an object
     * @param {Number} rgb.r Red
     * @param {Number} rgb.g Green
     * @param {Number} rgb.b Blue
     */
    constructor(id, name, rgb) {
        this.id = id
        this.name = name.toLowerCase()
        this.rgb = { ...rgb }
    }

    /**
     * Returns a string representation of an object
     */
    toString() {
        return '&' + this.id.toString(16)
    }

    /**
     * Remove all color codes from a string
     * @param {String} str The string to remove colors from
     * @returns {String} A string with all color codes removed
     */
    static stripColors(str) {
        return str.replace(/\&[0-9a-f]/g, '')
    }

    /**
     * Get a color by its code
     * @param {String|Number} c The code of the color to find (&0-&f or 0-15)
     * @returns {Color}
     */
    static fromCode(c) {
        if (typeof c === 'string') c = Number.parseInt(c.replace(/\&/g, ''), 16)
        else if (typeof c !== 'number') return Color.WHITE

        switch (c) {
            case Color.BLACK.id:
                return Color.BLACK
            case Color.NAVY.id:
                return Color.NAVY
            case Color.GREEN.id:
                return Color.GREEN
            case Color.TEAL.id:
                return Color.TEAL
            case Color.MAROON.id:
                return Color.MAROON
            case Color.PURPLE.id:
                return Color.PURPLE
            case Color.GOLD.id:
                return Color.GOLD
            case Color.SILVER.id:
                return Color.SILVER
            case Color.GRAY.id:
                return Color.GRAY
            case Color.BLUE.id:
                return Color.BLUE
            case Color.LIME.id:
                return Color.LIME
            case Color.AQUA.id:
                return Color.AQUA
            case Color.RED.id:
                return Color.RED
            case Color.PINK.id:
                return Color.PINK
            case Color.YELLOW.id:
                return Color.YELLOW
            case Color.WHITE.id:
            default:
                return Color.WHITE
        }
    }

    /**
     * Get a color by its name
     * @param {String} n The name of the color to find
     * @returns {Color}
     */
    static fromName(n) {
        if (typeof n !== 'string') return Color.WHITE
        switch (n.toLowerCase().trim()) {
            case Color.BLACK.name:
                return Color.BLACK
            case Color.NAVY.name:
                return Color.NAVY
            case Color.GREEN.name:
                return Color.GREEN
            case Color.TEAL.name:
                return Color.TEAL
            case Color.MAROON.name:
                return Color.MAROON
            case Color.PURPLE.name:
                return Color.PURPLE
            case Color.GOLD.name:
                return Color.GOLD
            case Color.SILVER.name:
                return Color.SILVER
            case Color.GRAY.name:
                return Color.GRAY
            case Color.BLUE.name:
                return Color.BLUE
            case Color.LIME.name:
                return Color.LIME
            case Color.AQUA.name:
                return Color.AQUA
            case Color.RED.name:
                return Color.RED
            case Color.PINK.name:
                return Color.PINK
            case Color.YELLOW.name:
                return Color.YELLOW
            case Color.WHITE.name:
            default:
                return Color.WHITE
        }
    }
}


function noop() { }
const levels = ['trace', 'debug', 'info', 'warn', 'error', 'silent']

interface Function {
    name: string
}

// Note: Map type is not available in ES5
// https://stackoverflow.com/questions/42211175/typescript-hashmap-dictionary-interface
interface IMap {
    [key: string]: () => void
}
const plugins: IMap = {}
// const plugins = new Map<string, () => void>()

interface Logging {
    trace(message?: any, ...optionalParams: any[]): void
}

class Logger implements Logging {
    private plugins: any[] = []
    private _level: number = 0
    private _name: string

    trace: (message?: any, ...optionalParams: any[]) => void = noop
    debug: (message?: any, ...optionalParams: any[]) => void = noop
    info: (message?: any, ...optionalParams: any[]) => void = noop
    warn: (message?: any, ...optionalParams: any[]) => void = noop
    error: (message?: any, ...optionalParams: any[]) => void = noop

    constructor(name: string, loglevel: number = 0) {
        this._level = loglevel
        useNativeMethods(this)
        this._name = name
    }

    get levels(): string[] {
        return levels.slice(0, 5)
    }

    get level(): number {
        return this._level
    }

    get name(): string {
        return this._name
    }

    setLevel(level: number): void
    setLevel(level: string): void
    setLevel(level: number | string): void {
        let intLevel: number = -1
        switch (typeof level) {
            case 'string':
                intLevel = levels.indexOf((<string>level).toLowerCase())
                break
            case 'number':
                intLevel = Math.floor(<number>level)
                break
        }

        if (typeof intLevel === 'number' && level >= 0 && level < levels.length) {
            this._level = intLevel
        } else {
            throw new Error(`Invalid level: ${level}`)
        }
    }

    /**
     * Create a child logger that uses the same logging level and plugins.
     * If new plugins are added to this logger, the child will use them, too.
     * If new plugins are added to the child, this logger will also use them.
     * 
     * @param name logger name
     */
    clone(name: string): Logger {
        const child = Object.create(this)
        child._name = name
        return child
    }

    /**
     * Create a child logger that uses the same logging level and plugins.
     * If new plugins are added to this logger, the child will not use them.
     * If new plugins are added to the child, this logger will not use them.
     * @param name child logger name
     */
    fork(name: string): Logger {
        const child = new Logger(name, this.level)
        child.plugins = this.plugins.slice()
        child._setLoggingMethods()
        return child
    }

    use(plugin: () => void): void {
        this.plugins.push(plugin)
        this._setLoggingMethods()
    }

    unuse(plugin: () => void): void {
        this.plugins = this.plugins.filter(p => p != plugin)
        this._setLoggingMethods()
    }

    private _setLoggingMethods(): void {
        if (this.plugins.length === 0) {
            useNativeMethods(this)
        } else {
            usePluginMethods(this)
        }
    }

    _transformMessage(message: Message): void {
        this.plugins.forEach(plugin => { plugin(message) })
    }
}

interface Message {
    args: any[],
    timestamp: number,
}

function useNativeMethods(logger: Logger): void {
    logger.levels.forEach((level: string, index: number) => {
        if (index < logger.level) {
            (<any>logger)[level] = noop
        } else {
            const native = (<any>console)[level] || console.log
            if (native instanceof Function) {
                (<any>logger)[level] = native.bind(console)
            }
        }
    })
}

function usePluginMethods(logger: Logger): void {
    logger.levels.forEach((level: string, index: number) => {
        if (index < logger.level) {
            (<any>logger)[level] = noop
        } else {
            const native = (<any>console)[level] || console.log
            if (native instanceof Function) {
                (<any>logger)[level] = function pluginLogger(...args: any[]): void {
                    const msg: Message = { args, timestamp: Date.now() }
                    logger._transformMessage(msg)

                    native.apply(console, msg.args)
                }
                // (<any>logger)[level].name = 'pluginLogger'
            }
        }
    })
}

function timestampPrefix(message: Message): void {
    const ts = new Date(message.timestamp).toISOString()
    message.args.unshift(ts)
}

const log = new Logger('', 0)

const Plugins = { timestampPrefix }

if (typeof window !== 'undefined') {
    (<any>window).Logger = Logger;
    (<any>window).log = log;
    (<any>window).Plugins = Plugins;
}


export { log, Logger, Plugins }

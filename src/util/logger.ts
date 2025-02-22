import { createLogger, format, transports } from 'winston'
import { ConsoleTransportInstance } from 'winston/lib/winston/transports'
import DailyRotateFile from 'winston-daily-rotate-file';
import util from 'util'
import config from '../config/config'
import { EApplicationEnvironment } from '../constant/application'
import path from 'path'
import * as sourceMapSupport from 'source-map-support'
import {blue, green, magenta, red, yellow} from 'colorette'
// Enable sourcemap support
sourceMapSupport.install()

const colorizedLevel = (level: string) => {
    switch (level) {
       case 'ERROR':
            return red(level)            
        case 'INFO':
            return blue(level)
        case 'WARN':
            return yellow(level)
        default:
            return level
    }
}

const consoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} as Record<string, unknown> } = info
    const customLevel = colorizedLevel(level.toUpperCase())
    const customMessage = message
    const customTimestamp = green(timestamp as string)
    const customMeta = util.inspect(meta, { showHidden: false, depth: null, colors: true })

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const customLog = `${customLevel} [${customTimestamp}] ${customMessage} \n${magenta('META')} ${customMeta}\n`
    return customLog
})

const consoleTransport = (): Array<ConsoleTransportInstance> => {
    if (config.ENV === EApplicationEnvironment.DEVELOPMENT) {
        return [
            new transports.Console({
                level: 'info',
                format: format.combine(format.timestamp(), consoleLogFormat)
            })
        ]
    }
    return []
}

const fileLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info
    const logMeta: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
        if (value instanceof Error) {
            logMeta[key] = {
                name: value.name,
                message: value.message,
                stack: value.stack || ''
            }
        } else {
            logMeta[key] = value
        }
    }

    const logData = {
        level: level.toUpperCase(),
        message: message,
        timestamp: timestamp,
        meta: logMeta
    }

    return JSON.stringify(logData, null, 4)
})

// const fileTransport = (): Array<FileTransportInstance> => {
//     return [
//         new transports.File({
//             filename: path.join(__dirname, '../', '../', 'logs', `${config.ENV}.log`),
//             level: 'info',
//             format: format.combine(format.timestamp(), fileLogFormat)
//         })
//     ]
// }

const rotatingFileTransport = new DailyRotateFile({
    dirname: path.join(__dirname, '../../logs'),
    filename: '%DATE%.log', // Logs saved with date-based filenames
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m', // Max file size before rotation
    maxFiles: '14d', // Keep logs for 14 days
    level: 'info',
    format: format.combine(format.timestamp(), fileLogFormat),
});

export default createLogger({
    defaultMeta: {
        meta: {}
    },
    transports: [rotatingFileTransport, ...consoleTransport()]
})


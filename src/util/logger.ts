import { createLogger, format, transports } from 'winston'
import { ConsoleTransportInstance } from 'winston/lib/winston/transports'
import DailyRotateFile from 'winston-daily-rotate-file';
import util from 'util'
import config from '../config/config'
import { EApplicationEnvironment } from '../constant/application'
import path from 'path'
import * as sourceMapSupport from 'source-map-support'

// Enable sourcemap support
sourceMapSupport.install()

const consoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} as Record<string, unknown> } = info
    const customLevel = level.toUpperCase()
    const customMessage = message
    const customTimestamp = timestamp
    const customMeta = util.inspect(meta, { showHidden: false, depth: null })

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const customLog = `${customLevel} [${customTimestamp}] ${customMessage} \n${'META'} ${customMeta}\n`
    return customLog
})

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


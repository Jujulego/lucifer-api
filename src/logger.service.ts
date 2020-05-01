import { env } from 'env';
import { DIContainer } from 'inversify.config';

import { Service } from 'utils';

// Enum
export enum LogLevel {
  DEBUG = 10,
  INFO = 20,
  WARNING = 30,
  ERROR = 40,
  CRITICAL = 50
}

// Utils
export function isLogLevel(value: string): value is keyof typeof LogLevel {
  return (value === 'DEBUG' || value === 'INFO' || value == 'WARNING' || value == 'ERROR' || value == 'CRITICAL');
}

// Service
@Service()
export class LoggerService {
  // Attributes
  private _level = LogLevel.DEBUG;
  private readonly stream = process.stdout;

  // Constructor
  constructor() {
    // Start level based on env
    const level = env.LOG_LEVEL.toUpperCase();

    if (isLogLevel(level)) {
      this._level = LogLevel[level];
    } else if (env.PRODUCTION) {
      this._level = LogLevel.INFO;
    }
  }

  // Methods
  log(level: LogLevel, msg: string) {
    if (level >= this._level) {
      let line: string;

      switch (level) {
        case LogLevel.CRITICAL:
          line = `\x1b[m\x1b[31;1m${msg}\x1b[m`; // bold red
          break;

        case LogLevel.ERROR:
          line = `\x1b[m\x1b[31m${msg}\x1b[m`; // red
          break;

        case LogLevel.WARNING:
          line = `\x1b[m\x1b[33m${msg}\x1b[m`; // yellow
          break;

        case LogLevel.DEBUG:
          line = `\x1b[m\x1b[34m${msg}\x1b[m`; // blue
          break;

        case LogLevel.INFO:
        default:
          line = msg;
      }

      if (!msg.endsWith('\n')) {
        line += '\n';
      }

      this.stream.write(line);
    }
  }

  debug(   msg: string) { return this.log(LogLevel.DEBUG,    msg); }
  info(    msg: string) { return this.log(LogLevel.INFO,     msg); }
  warning( msg: string) { return this.log(LogLevel.WARNING,  msg); }
  error(   msg: string) { return this.log(LogLevel.ERROR,    msg); }
  critical(msg: string) { return this.log(LogLevel.CRITICAL, msg); }

  get level(): LogLevel {
    return this._level
  }

  set level(level: LogLevel) {
    this._level = level;
  }
}

// Stream
export class LoggerStream {
  // Attributes
  private logger: LoggerService | null = null;

  // Constructor
  constructor(
    private readonly level: LogLevel
  ) {}

  // Methods
  write(msg: string) {
    if (!this.logger) {
      this.logger = DIContainer.get(LoggerService)
    }

    this.logger.log(this.level, msg);
  }
}

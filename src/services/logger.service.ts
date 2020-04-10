import env from 'env';

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
@Service(LoggerService)
class LoggerService {
  // Attributes
  private _level = LogLevel.DEBUG;
  private readonly stream = process.stdout;

  // Constructor
  constructor() {
    // Start level based on env
    const level = env.LOG_LEVEL.toUpperCase();
    if (isLogLevel(level)) this._level = LogLevel[level];
  }

  // Methods
  log(level: LogLevel, msg: string) {
    if (level >= this._level) {
      this.stream.write(`${msg}\n`);
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

export default LoggerService;

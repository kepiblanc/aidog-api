import pino from 'pino';

const getTimestamp = () => new Date().toISOString().replace('T', ' ').replace('Z', '');

class Logger {
  private pinoLogger: pino.Logger;
  private name: string;

  constructor(service?: string) {
    this.name = service || 'service';
    this.pinoLogger = pino({ name: this.name });
  }
  info(message: string, data?: any) {
    const log = typeof data === 'string' ? data : JSON.stringify(data ? {
      ...data,
    } : {});
    this.pinoLogger.info(`[${getTimestamp()}] ${message} ${log}`);
  }

  error(message: string, data?: any) {
    const log = typeof data === 'string' ? data : JSON.stringify(data ? {
      ...data,
    } : {});
    this.pinoLogger.error(`[${getTimestamp()}] ${message} ${log}`);
  }
}

export default Logger;
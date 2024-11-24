import app from './app'
import Logger from './common/logger';
import { MongoDB } from './common/mongodb';

let server: any;
const PORT = process.env.PORT || 7000;
const logger = new Logger("server");

(async () => {
  try {
    await MongoDB();
    
    server = app.listen(PORT, () =>
      logger.info(`Server started ⚡`, { port: PORT }),
    )
  } catch (error: any) {
    return logger.error("Unable to create server", { error: error?.message });
  }
})();

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

function gracefulShutdown() {
  if (!server) process.exit(1);

  server.close(async (err: any) => {
    if (err) process.exit(1);

    try {
      logger.info('Server gracefully shutting down');
      process.exit(0);
    } catch (error) {
      process.exit(1);
    }
  });
}

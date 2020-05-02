import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const dbConfig = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  type: dbConfig.type,
  host: process.env.DATABASE_HOST || dbConfig.host,
  port: process.env.DATABASE_PORT || dbConfig.port,
  username: process.env.DATABASE_USERNAME || dbConfig.username,
  password: process.env.DATABASE_PASSWORD || dbConfig.password,
  database: process.env.DATABASE_NAME || dbConfig.database,
  synchronize: process.env.TYPEORM_SYNC || dbConfig.synchronize,
};

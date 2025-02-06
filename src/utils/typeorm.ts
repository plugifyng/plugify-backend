import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as fs from 'fs';
import { TypeOrmModuleOptions } from '@nestjs/typeorm'; // Correct import for TypeOrmModuleOptions

dotenvConfig({ path: '.env' });
let config = {};

if (process.env.NODE_ENV == 'production') {
  config = {
    type: 'postgres',
    url: `${process.env.PG_URL}`,
    autoLoadEntities: true,
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    migrationsTableName: 'plugify_migration_table',
    synchronize: false,
    migrationsRun: true,
    ssl: {
      //ca: fs.readFileSync('src/utils/crt/rds-ca-2019-root.pem').toString(),
    },
    cli: {
      migrationsDir: 'src/migrations',
    },
  };
} else {
  config = {
    type: 'postgres',
    url: `${process.env.PG_URL}`,
    autoLoadEntities: true,
    entities: ['dist/src/**/*.entity{.ts,.js}'],
    migrations: ['dist/src/migrations/*{.ts,.js}'],
    migrationsTableName: 'plugify_migration_table',
    synchronize: true,
    migrationsRun: true,
    ssl: process.env.SSL === 'true' ? true : false,
    cli: {
      migrationsDir: 'src/migrations',
    },
  };
}

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);

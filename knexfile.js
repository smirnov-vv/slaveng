import path from 'path';

export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(process.cwd(), 'dev.sqlite3'),
    },
    migrations: {
      directory: './server/migrations',
    },
    useNullAsDefault: true, // Required for SQLite
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    },
    migrations: {
      directory: './server/migrations',
    },
  },
};

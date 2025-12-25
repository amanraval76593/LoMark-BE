import { Pool } from 'pg'
import config from '../config';

export const postgresPool = new Pool({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    max: 10,               // connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});


export const connectPostgres = async () => {
    await postgresPool.query("SELECT 1");
    console.log("PostgreSQL connected");
};
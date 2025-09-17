
import mysql from 'mysql2/promise';

declare global {
    // eslint-disable-next-line no-var
    var __mysql_pool: mysql.Pool | undefined | null;
}

function initializeMySQLPool(): mysql.Pool | null {
    if (global.__mysql_pool === null) {
        return null;
    }
    if (global.__mysql_pool) {
        return global.__mysql_pool;
    }

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.warn('DATABASE_URL is not set. MySQL connection pool initialization skipped.');
        global.__mysql_pool = null;
        return null;
    }

    try {
        const pool = mysql.createPool(dbUrl);
        console.log('MySQL connection pool initialized successfully.');
        global.__mysql_pool = pool;
        return pool;
    } catch (error: any) {
        console.error('MySQL connection pool initialization error:', error.message);
        global.__mysql_pool = null;
        return null;
    }
}

export const db = initializeMySQLPool();

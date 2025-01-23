import { Kysely, CamelCasePlugin, MysqlDialect } from "kysely";
import type { DB } from "./db.types";
import { createPool } from "mysql2";

const { DB_HOST, DB_NAME, DB_PORT, DB_USER, DB_PASSWORD, DB_CONNECTION_LIMIT } = process.env;

if (!DB_HOST || !DB_NAME || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_CONNECTION_LIMIT) {
    console.error("Database configuration is missing. Please check .env file.");
    process.exit(1);
}

declare global {
    var db: Kysely<DB>;
}

export const db =
    global.db ||
    new Kysely<DB>({
        dialect: new MysqlDialect({
            pool: createPool({
                database: DB_NAME,
                host: DB_HOST,
                user: DB_USER,
                password: DB_PASSWORD,
                port: DB_PORT,
                connectionLimit: DB_CONNECTION_LIMIT,
                typeCast(field, next) {
                    if (field.type === "BLOB") {
                        return JSON.parse(field.string() || "{}");
                    }
                    return next();
                },
            }),
        }),
        plugins: [new CamelCasePlugin()],
    });

global.db = db;

import { Kysely, CamelCasePlugin, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { DB } from "./db.types";

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
                database: process.env.DB_NAME,
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                port: parseInt(process.env.DB_PORT),
                connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT),
                typeCast(field, next) {
                    if (field.type === "LONGLONG") {
                        return next();
                        return field.string();
                    } else if (field.type === "BLOB") {
                        return JSON.parse(field.string() || "{}");
                    } else {
                        return next();
                    }
                },
            }),
        }),
        plugins: [new CamelCasePlugin()],
    });

global.db = db;

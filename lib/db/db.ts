import { Kysely, CamelCasePlugin, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { DB } from "./db.types";

if (
    !process.env.DB_NAME ||
    !process.env.DB_HOST ||
    !process.env.DB_USER ||
    !process.env.DB_PASSWORD ||
    !process.env.DB_PORT ||
    !process.env.DB_CONNECTION_LIMIT
) {
    throw new Error("Missing database configuration");
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

import { PlanetScaleDialect } from "kysely-planetscale";
import { Database } from "./types";
import { Kysely } from "kysely";

export const db = new Kysely<Database>({
    dialect: new PlanetScaleDialect({
        host: process.env.PLANETSCALE_HOST,
        username: process.env.PLANETSCALE_USERNAME,
        password: process.env.PLANETSCALE_PASSWORD,
    }),
});

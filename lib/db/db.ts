import { PlanetScaleDialect } from "kysely-planetscale";
import { Kysely, CamelCasePlugin } from "kysely";
import { Database } from "./types";

export const db = new Kysely<Database>({
    dialect: new PlanetScaleDialect({
        host: process.env.PLANETSCALE_HOST,
        username: process.env.PLANETSCALE_USERNAME,
        password: process.env.PLANETSCALE_PASSWORD,
        useSharedConnection: true,
    }),
    plugins: [new CamelCasePlugin()],
    log: ["query"],
});

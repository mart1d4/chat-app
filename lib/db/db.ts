import { PlanetScaleDialect } from "kysely-planetscale";
import { Kysely, CamelCasePlugin } from "kysely";
import { Database } from "./types";

export const db = new Kysely<Database>({
    dialect: new PlanetScaleDialect({
        url: process.env.DATABASE_URL,
        useSharedConnection: true,
    }),
    plugins: [new CamelCasePlugin()],
    log: ["query"],
});

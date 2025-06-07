import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

console.log("Bootstrap: Loading environment variables...");

await config({ path: "./backend/.env", export: true });

console.log("Bootstrap: Environment variables loaded.");
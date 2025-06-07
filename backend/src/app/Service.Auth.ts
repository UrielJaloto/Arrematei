import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const cJwtKey = Deno.env.get("JWT_SECRET_KEY");
if (!cJwtKey) {
  throw new Error("JWT_SECRET_KEY is not defined in the .env file");
}

const cCryptoKey = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(cJwtKey),
  { name: "HMAC", hash: "SHA-256" },
  true,
  ["sign", "verify"],
);

export async function createJwtToken(pUserId: number, pUserEmail: string): Promise<string> {
  const vPayload = {
    uid: pUserId,
    email: pUserEmail,
    exp: getNumericDate(60 * 60 * 24), // Expires in 24 hours
  };

  const vJwt = await create({ alg: "HS256", typ: "JWT" }, vPayload, cCryptoKey);
  return vJwt;
}
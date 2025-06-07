import { createJwtToken } from "../app/Service.Auth.ts";
import { comparePassword } from "../app/Deps.ts";
import UserModel from "../models/Model.User.ts";

export async function registerUser(pRequest: Request): Promise<Response> {
  if (!pRequest.body) {
     return new Response(JSON.stringify({ message: "Request body is missing" }), { status: 400 });
  }
  const vBody = await pRequest.json();
  const { username, email, password } = vBody;

  if (!username || !email || !password) {
    return new Response(JSON.stringify({ message: "Fields username, email and password are required" }), { 
        status: 400, headers: { "Content-Type": "application/json" }
    });
  }

  const vExistingUser = await UserModel.findUserByEmail(email);
  if (vExistingUser) {
    return new Response(JSON.stringify({ message: "Email already registered" }), { 
        status: 409, headers: { "Content-Type": "application/json" }
    });
  }
  
  const vNewUser = await UserModel.createUser({ username, email }, password);

  // Exclude password hash from the response for security
  const { password_hash, ...vUserResponse } = vNewUser;

  return new Response(JSON.stringify(vUserResponse), {
    status: 201, headers: { "Content-Type": "application/json" }
  });
}

export async function loginUser(pRequest: Request): Promise<Response> {
  if (!pRequest.body) {
     return new Response(JSON.stringify({ message: "Request body is missing" }), { status: 400 });
  }
  const vBody = await pRequest.json();
  const { email, password } = vBody;

  if (!email || !password) {
    return new Response(JSON.stringify({ message: "Email and password are required" }), { status: 400 });
  }

  const vUser = await UserModel.findUserByEmail(email);
  if (!vUser) {
    return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
  }

  const vIsPasswordCorrect = await comparePassword(password, vUser.password_hash);
  if (!vIsPasswordCorrect) {
    return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
  }
  
  const vToken = await createJwtToken(vUser.id, vUser.email);
  return new Response(JSON.stringify({ token: vToken }), {
    status: 200, headers: { "Content-Type": "application/json" }
  });
}
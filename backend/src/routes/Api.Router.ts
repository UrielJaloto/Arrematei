import { cRouterInstance } from "../app/Core.Router.ts";
import * as AuthController from "../controllers/Controller.Auth.ts";

cRouterInstance.addRoute("POST", "/api/auth/register", AuthController.registerUser);
cRouterInstance.addRoute("POST", "/api/auth/login", AuthController.loginUser);

export default cRouterInstance;
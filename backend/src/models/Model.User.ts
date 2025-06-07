import { IUser, IUserModel } from "../interfaces/Interfaces.IUserModel.ts";
import { postgres } from "../app/Deps.ts";
import { hashPassword } from "../app/Deps.ts";

// =================================================================
// IMPLEMENTAÇÃO REAL (PostgreSQL)
// Esta parte ficará esperando o banco de dados ficar pronto.
// =================================================================
class RealUserModel implements IUserModel {
    private cSql;

    constructor() {
        // SO SERÁ USADO QUANDO USE_MOCK_DB is false
        const vDbUrl = `postgres://${Deno.env.get("DB_USER")}:${Deno.env.get("DB_PASSWORD")}@${Deno.env.get("DB_HOST")}:${Deno.env.get("DB_PORT")}/${Deno.env.get("DB_NAME")}`;
        this.cSql = postgres(vDbUrl);
        console.log("[DB] Real Database Model Initialized.");
    }

    async findUserByEmail(pEmail: string): Promise<IUser | null> {
        const vResult = await this.cSql<IUser[]>`SELECT id, username, email, password_hash FROM users WHERE email = ${pEmail}`;
        return vResult.length > 0 ? vResult[0] : null;
    }

    async createUser(pUserData: Pick<IUser, "username" | "email">, pPlainTextPassword: string): Promise<IUser> {
        const vPasswordHash = await hashPassword(pPlainTextPassword);
        const vResult = await this.cSql<IUser[]>`
            INSERT INTO users (username, email, password_hash)
            VALUES (${pUserData.username}, ${pUserData.email}, ${vPasswordHash})
            RETURNING id, username, email, password_hash, registration_date
        `;
        return vResult[0];
    }
}

// =================================================================
// IMPLEMENTAÇÃO MOCK 
// Esta parte será usada para testes enquanto o banco não está pronto.
// =================================================================
class MockUserModel implements IUserModel {
    private cMockUsers: IUser[] = [];

    constructor() {
        hashPassword("password123").then(vPasswordHash => {
            this.cMockUsers.push({
                id: 1,
                username: "testuser",
                email: "user@example.com",
                password_hash: vPasswordHash,
                registration_date: new Date()
            });
        });
        console.log("[MOCK] In-Memory Mock Model Initialized.");
    }
    
    //manter async sem await para cumprir a interface
    async findUserByEmail(pEmail: string): Promise<IUser | null> {
        const vFoundUser = this.cMockUsers.find(pUser => pUser.email === pEmail);
        return vFoundUser || null;
    }

    async createUser(pUserData: Pick<IUser, "username" | "email">, pPlainTextPassword: string): Promise<IUser> {
        const vPasswordHash = await hashPassword(pPlainTextPassword); // Aqui usamos await, então async é necessário
        const vNewId = this.cMockUsers.length > 0 ? Math.max(...this.cMockUsers.map(u => u.id)) + 1 : 1;
        const vNewUser: IUser = {
            id: vNewId,
            ...pUserData,
            password_hash: vPasswordHash,
            registration_date: new Date()
        };
        this.cMockUsers.push(vNewUser);
        return vNewUser;
    }
}

// =================================================================
// EXPORTAÇÃO CONDICIONAL 
// =================================================================
const cUseMock = Deno.env.get("USE_MOCK_DB") === "true";

const UserModel: IUserModel = cUseMock 
    ? new MockUserModel() 
    : new RealUserModel();

export default UserModel;
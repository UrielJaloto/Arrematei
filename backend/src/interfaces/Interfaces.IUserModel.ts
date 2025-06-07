export interface IUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  registration_date: Date;
}

export interface IUserModel {
  findUserByEmail(pEmail: string): Promise<IUser | null>;
  
  createUser(pUserData: Pick<IUser, "username" | "email">, pPlainTextPassword: string): Promise<IUser>;
}
import { LoginInput, SignupInput } from "@/schema/auth.schema";
const DUMMY_USER = {
  email: "test@kofora.com",
  password: "password123",
  name: "Test User",
};

export async function dummyLogin({ email, password }: LoginInput) {
  await new Promise((res) => setTimeout(res, 800));
  if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
    return { user: { name: DUMMY_USER.name, email: DUMMY_USER.email } };
  }
  throw new Error("Invalid email or password");
}

export async function dummySignup({ name, email }: SignupInput) {
  await new Promise((res) => setTimeout(res, 800));
  if (email === DUMMY_USER.email) {
    throw new Error("Email already in use");
  }
  return { user: { name, email } };
}
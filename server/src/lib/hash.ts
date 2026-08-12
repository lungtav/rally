import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const hasher = async (value: string): Promise<string> => {
  return bcrypt.hash(value, SALT_ROUNDS);
};

const compare = async (value: string, hash: string) => {
  return bcrypt.compare(value, hash);
};

export { hasher, compare};

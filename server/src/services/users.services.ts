import type { ChangePasswordInput } from "../types/user.types.js";
import { pool } from "../config/database.js";
import { hasher, compare } from "../lib/hash.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";

const getMe = async (userId: string) => {
  //check user exists
  const userRow = await pool.query(
    `
    SELECT id, username, email, role FROM users WHERE id =$1`,
    [userId],
  );

  const user = userRow.rows[0];

  if (!user) {
    throw new NotFoundError("user not found");
  }

  return user;
};

const changePassword = async (input: ChangePasswordInput) => {
  const { userId, currentPassword, newPassword } = input;

  //check user exists
  const userRow = await pool.query(
    `
    SELECT password_hash FROM users WHERE id =$1`,
    [userId],
  );

  const user = userRow.rows[0];

  if (!user) {
    throw new NotFoundError("user doesn't exist");
  }

  //if old password is correct
  const isPaswordMatch = await compare(currentPassword, user.password_hash);

  if (!isPaswordMatch) {
    throw new ValidationError("current password is incorrect");
  }

  //revoke token
  await pool.query(
    `
    UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId],
  );

  //hash new password
  const newPasswordHash = await hasher(newPassword);

  //log to db

  await pool.query(
    `
    UPDATE users SET password_hash =$1 WHERE id =$2`,
    [newPasswordHash, userId],
  );

  return;
};

export { changePassword, getMe };

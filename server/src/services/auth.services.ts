import type {
  SignUpInput,
  VerifyOtpArgBody,
  LoginInput,
} from "../types/auth.types.js";
import { pool } from "../config/database.js";
import { ConflictError } from "../errors/ConflictError.js";
import { hasher, compare } from "../lib/hash.js";
import { generateOtp } from "../lib/otp.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { generateAccessToken, generateRefreshToken } from "../lib/tokens.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { verifyEmail } from "../services/email.services.js";

const signup = async (input: SignUpInput) => {
  const { username, email, password } = input;

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);

  if (existing.rows.length) {
    throw new ConflictError("an account with this email already exists");
  }

  //hash password
  const passwordHash = await hasher(password);

  //input data

  let user;

  try {
    const result = await pool.query(
      `
    INSERT INTO users (username, email, password_hash ) VALUES ($1, $2,$3)
    RETURNING id, username, email, role, created_at
    `,
      [username, email, passwordHash],
    );

    user = result.rows[0];
  } catch (error: any) {
    if (error.code === "23505") {
      throw new ConflictError("an account with this email exists");
    }

    throw error;
  }

  //genearate otp
  const { otp, expiresAt } = generateOtp();
  const otpHash = await hasher(otp);

  //save to db
  await pool.query(
    `
    UPDATE users SET otp_code = $1, otp_expires_at=$2 WHERE id = $3
    `,
    [otpHash, expiresAt, user.id],
  );

  //email user
  await verifyEmail(email, otp);

  return user;
};

const verifyOtp = async (input: VerifyOtpArgBody) => {
  const { email, otp, sessionInformation } = input;

  //find the user

  const result = await pool.query(
    `
    SELECT  id, username, email, role, is_email_verified, otp_code, otp_expires_at 
    FROM users WHERE email = $1
    `,
    [email],
  );

  const user = result.rows[0];

  if (!user) {
    throw new NotFoundError("user not found");
  }

  //if already verified
  if (user.is_email_verified) {
    throw new ConflictError("email already verified");
  }

  if (!user.otp_expires_at) {
    throw new ValidationError("no active otp");
  }

  //if otp is still valid
  if (new Date() > user.otp_expires_at) {
    throw new ValidationError("otp has expired");
  }

  const otpCompare = await compare(otp, user.otp_code);

  if (!otpCompare) {
    //compare otp
    throw new ValidationError("invalid otp");
  }

  //update db
  await pool.query(
    `
    UPDATE users SET is_email_verified=true, otp_code=NULL, otp_expires_at=NULL WHERE id=$1
    `,
    [user.id],
  );

  //create access token and refresh token
  const accessToken = generateAccessToken(user.id, user.role);
  const { refreshToken, expiresAt } = generateRefreshToken();

  const refreshTokenHash = await hasher(refreshToken);

  //add refresh token to db
  await pool.query(
    `
    INSERT INTO refresh_tokens (token_hash, session_information, expires_at, user_id) VALUES($1,$2,$3,$4)
    `,
    [refreshTokenHash, sessionInformation, expiresAt, user.id],
  );

  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isEmailVerified: true,
  };

  return {
    user: safeUser,
    accessToken,
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
  };
};

const login = async (input: LoginInput) => {
  const { email, password, sessionInformation } = input;

  //check if email exists
  const result = await pool.query(
    `
    SELECT  id, username, email, role, is_email_verified, password_hash
    FROM users WHERE email = $1
  `,
    [email],
  );

  const user = result.rows[0];

  //if user doesnt exists
  if (!user) {
    throw new UnauthorizedError("invalid email or password");
  }

  //if password is incorrect
  const passwordMatch = await compare(password, user.password_hash);

  if (!passwordMatch) {
    throw new UnauthorizedError("invalid email or password");
  }

  //if email is unverified
  if (!user.is_email_verified) {
    throw new ForbiddenError("verify email before login");
  }

  //create access token and refresh token
  const accessToken = generateAccessToken(user.id, user.role);
  const { refreshToken, expiresAt } = generateRefreshToken();

  const refreshTokenHash = await hasher(refreshToken);

  //add refresh token to db
  await pool.query(
    `
    INSERT INTO refresh_tokens (token_hash, session_information, expires_at, user_id) VALUES($1,$2,$3,$4)
    `,
    [refreshTokenHash, sessionInformation, expiresAt, user.id],
  );

  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isEmailVerified: user.is_email_verified,
  };

  return {
    user: safeUser,
    accessToken,
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
  };
};

const refresh = async (refreshToken: string) => {
  //get the list of all refresh tokens
  const result = await pool.query(`
    SELECT id, token_hash,session_information, expires_at, revoked_at, user_id, replaced_by_token_id 
    FROM refresh_tokens 
    WHERE revoked_at IS NULL 
    AND replaced_by_token_id IS NULL 
    AND expires_at > NOW() 
  `);

  //crosscheck for matching token
  let matchedToken;

  for (const token of result.rows) {
    const isMatch = await compare(refreshToken, token.token_hash);

    if (isMatch) {
      matchedToken = token;
      break;
    }
  }

  if (!matchedToken) {
    throw new UnauthorizedError("invalid refresh token");
  }

  //get user
  const userResult = await pool.query(
    `
    SELECT id, role FROM users WHERE id=$1
    `,
    [matchedToken.user_id],
  );

  const user = userResult.rows[0];

  if (!user) {
    throw new UnauthorizedError("invalid refresh token");
  }

  //generate tokens
  const accessToken = generateAccessToken(user.id, user.role);

  const { refreshToken: newRefreshToken, expiresAt } = generateRefreshToken();
  const refreshTokenHash = await hasher(newRefreshToken);

  //add new refresh token to db
  const refreshTokenResult = await pool.query(
    `
    INSERT INTO refresh_tokens (token_hash, session_information, expires_at, user_id) 
    VALUES($1,$2,$3,$4)
    RETURNING id;
    `,
    [refreshTokenHash, matchedToken.session_information, expiresAt, user.id],
  );
  const refreshTokenRow = refreshTokenResult.rows[0];

  //revoke old refresh token
  await pool.query(
    `
    UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_token_id = $1
    WHERE id =$2
    `,
    [refreshTokenRow.id, matchedToken.id],
  );

  return {
    accessToken,
    newRefreshToken,
    refreshTokenExpiresAt: expiresAt,
  };
};

const logout = async (refreshToken: string) => {
  //get the list of all refresh tokens
  const result = await pool.query(`
    SELECT id, token_hash, session_information, expires_at, revoked_at, user_id, replaced_by_token_id 
    FROM refresh_tokens 
    WHERE revoked_at IS NULL 
    AND replaced_by_token_id IS NULL 
    AND expires_at > NOW() 
  `);

  //crosscheck for matching token
  let matchedToken;

  for (const token of result.rows) {
    const isMatch = await compare(refreshToken, token.token_hash);

    if (isMatch) {
      matchedToken = token;
      break;
    }
  }

  if (!matchedToken) {
    throw new UnauthorizedError("invalid refresh token");
  }

  //revoke the refresh token
  await pool.query(
    `
    UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_token_id = $1
    WHERE id =$2
    `,
    [null, matchedToken.id],
  );
};

export { signup, verifyOtp, login, refresh, logout };

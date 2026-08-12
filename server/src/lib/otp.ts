import crypto from "node:crypto";

const OTP_EXPIRY_TIME = 5;

export const generateOtp = function () {
  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_TIME * 60 * 1000);

  return { otp, expiresAt };
};

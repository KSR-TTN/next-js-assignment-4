import jwt from "jsonwebtoken";
import ApiError from "./ApiError.js";
import jwtConfig from "../../../config/jwt.config.js";

const generateAccessToken = (id, name, email, role) => {
  return jwt.sign({ id, name, email, role }, jwtConfig.ACCESS_TOKEN_SECRET, {
    expiresIn: jwtConfig.ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, jwtConfig.REFRESH_TOKEN_SECRET, {
    expiresIn: jwtConfig.REFRESH_TOKEN_EXPIRY,
  });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(403, "Invalid or Expired Token");
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(403, "Invalid or Expired Token");
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

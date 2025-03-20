import { pool } from "../../db/index.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { hashValue, compareValue } from "../utils/bcrypt.js";
import {
  generateRefreshToken,
  generateAccessToken,
} from "../utils/jwtTokens.js";

// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "all fields are required");
  }

  const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (userQuery.rowCount === 0) {
    throw new ApiError(404, "User not found");
  }

  const user = userQuery.rows[0];

  const isMatch = await compareValue(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = await generateAccessToken(user.id, user.name, user.email);
  const refreshToken = await generateRefreshToken(user.id);

  await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
    refreshToken,
    user.id,
  ]);

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          refreshToken,
          accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            age: user.age,
          },
        },
        "Login successful"
      )
    );
});

// logout user

const logoutUser = asyncHandler(async (req, res) => {
  await pool.query("UPDATE users SET refresh_token = NULL WHERE id = $1", [
    req.user.id,
  ]);

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .status(200)
    .json(new ApiResponse(200, null, "Logout successful"));
});

// get users
const getAllUsers = async (req, res) => {
  const users = await pool.query("SELECT * FROM users");
  if (users.rowCount === 0) throw new ApiError(500, "No users in bd");
  res.status(200).json({
    data: users.rows,
    success: true,
  });
};

// add user
const addUser = asyncHandler(async (req, res) => {
  const { name, email, password, age } = req.body;
  if (!name || !email || !age || !password) {
    throw new ApiError(400, "all fields are required");
  }

  const userExists = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  if (userExists.rows[0]) {
    throw new ApiError(409, "user already exists");
  }

  const hashedPassword = await hashValue(password);
  const user = await pool.query(
    "INSERT INTO users (name, email, password, age) VALUES ($1, $2, $3, $4) RETURNING  id, name, email, age;",
    [name, email, hashedPassword, age]
  );
  if (!user.rows[0]) {
    throw new ApiError(500, "err in creating user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, user.rows[0], "User created successfully"));
});

// update users
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;
  if (!name && !email && !age)
    throw new ApiError(400, "send atleast one data to update");

  const query = `
    UPDATE users SET 
    name = CASE WHEN $1::text IS NOT NULL THEN $1 ELSE name END,
    email = CASE WHEN $2::text IS NOT NULL THEN $2 ELSE email END,
    age = CASE WHEN $3::integer IS NOT NULL THEN $3 ELSE age END
    WHERE id = $4
    RETURNING id, name, email, age;
  `;

  const values = [name, email, age, id];

  const updatedUser = await pool.query(query, values);

  if (updatedUser.rowCount === 0) {
    throw new ApiError(404, "usernot found while updating user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser.rows[0], "user updated"));
});

// remove user
const removeUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id, name, email, age",
    [id]
  );

  if (user.rowCount === 0) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user.rows[0], "user deleted successfully"));
});

export { getAllUsers, removeUser, updateUser, addUser, loginUser, logoutUser };

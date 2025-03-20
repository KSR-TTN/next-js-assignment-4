import { Router } from "express";
import {
  getAllUsers,
  removeUser,
  updateUser,
  addUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(getAllUsers).post(addUser);
router
  .route("/:id")
  .patch(authMiddleware, updateUser)
  .delete(authMiddleware, removeUser);
router.route("/login").post(loginUser);
router.route("/logout").post(authMiddleware, logoutUser);

export default router;

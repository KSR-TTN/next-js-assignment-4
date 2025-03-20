import { Router } from "express";
import {
  getAllUsers,
  removeUser,
  updateUser,
  addUser,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/").get(getAllUsers).post(addUser);
router.route("/:id").patch(updateUser).delete(removeUser);

export default router;

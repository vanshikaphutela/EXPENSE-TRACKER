import express from "express";
import {
  registerControllers,
  loginControllers,
  setAvatarController,
  allUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerControllers);
router.post("/login", loginControllers);
router.post("/setAvatar/:id", setAvatarController);
router.get("/allUsers/:id", allUsers);

export default router;

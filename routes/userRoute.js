import express from "express";
import {signup,login,alluser,googleLogin} from '../controller/userController.js'
import { authorization } from "../middleware/authorization.js";
const router = express.Router();

router.post("/signup",signup);
router.post('/login',login);
router.post('/google-login',googleLogin);
router.get('/alluser',authorization ,alluser);



export default router;

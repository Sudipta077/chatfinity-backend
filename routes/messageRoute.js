import express from "express";
import { authorization } from "../middleware/authorization.js";
import { fetchMessage,sendMessage } from "../controller/messageController.js";
const router = express.Router();

router.post('/',authorization,sendMessage);
router.get('/:chatId',authorization,fetchMessage);


export default router;
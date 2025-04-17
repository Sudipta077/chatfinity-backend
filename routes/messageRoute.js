import express from "express";
import { authorization } from "../middleware/authorization.js";
import { fetchMessage,sendMessage,sendFiles, getFiles } from "../controller/messageController.js";
const router = express.Router();

router.post('/',authorization,sendMessage);
router.put('/sendFile/:chatId',authorization,sendFiles);
router.get('/getFile',authorization,getFiles);
router.get('/:chatId',authorization,fetchMessage);



export default router;
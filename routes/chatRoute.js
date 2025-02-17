import express from 'express'
import { authorization } from '../middleware/authorization.js';
import { createChat } from '../controller/chatController.js';

const router = express.Router();

router.get('/',authorization,createChat);
// router.get('/',authorization,fetchChat);
// router.get('/group',authorization,groupCreate);
// router.get('/renamegroup',authorization,renameGroup);
// router.get('/groupremove',authorization,removeFromGroup);
// router.get('/groupadd',authorization,groupAdd);






export default router;
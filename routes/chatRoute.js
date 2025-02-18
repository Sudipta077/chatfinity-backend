import express from 'express'
import { authorization } from '../middleware/authorization.js';
import { createChat,fetchChat,groupCreate,renameGroup,groupAdd,removeFromGroup } from '../controller/chatController.js';

const router = express.Router();

router.post('/',authorization,createChat);
router.get('/',authorization,fetchChat);
router.post('/group',authorization,groupCreate);
router.put('/renamegroup',authorization,renameGroup);
router.post('/groupadd',authorization,groupAdd);
router.post('/groupremove',authorization,removeFromGroup);






export default router;
import express from 'express';
import ChatController from './../controllers/chatController';
// import ChatController from './../controllers/chatController1to1';
// import ChatController from './../controllers/chatControllerL';
import { executeAsync } from './../helpers/appHelper';

export default (io) => {
  const ChatControl = new ChatController(io);

  const router = express.Router();

  router.get('/', (req, res) => {
    res.send('Auth');
  });

  router.get('/chat', executeAsync(ChatControl.index));

  return router;
};

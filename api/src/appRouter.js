import express from 'express';
import chatRouter from './routers/chatRouter';
import { executeAsync } from './helpers/appHelper';

export default (io) => {
  const router = express.Router();

  router.use('/auth', (req, res) => {
    res.send('Auth');
  });

  router.use('/chat', chatRouter(io));

  router.use(
    '*',
    executeAsync(() => {
      throw new Error('404');
    })
  );

  return router;
};

import { Router } from 'express';
const router = Router();

import { getPosts } from '../controllers/posts.controller'

router.route('/')
  .get(getPosts)
/***************************************************** */

export default router
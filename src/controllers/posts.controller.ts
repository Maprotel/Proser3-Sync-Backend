import { Request, Response } from 'express'

import { connect } from '../database';


export async function getPosts(req: Request, res: Response): Promise<Response> {

  const conn = await connect();
  const posts = await conn.query(`SELECT * FROM node_mysql_ts.posts`);
  return res.json(posts[0])
};


export async function createPosts(req: Request, res: Response) {
  const newPost = req.body;
};
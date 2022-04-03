// Packages
import { Router } from 'express';
import pick from 'lodash.pick';
// Models
import models from '../models';
// Utils
import asyncWrapper from '../utils/asyncWrapper';
// Middleware
import requiresAuth from '../middleware/requiresAuth';
// Helpers
import { SUCCESSFULLY_CREATED } from '../helpers/responseMessages';

const router = Router();

const { Post, User } = models;

router.post(
  '/',
  requiresAuth(),
  asyncWrapper(async (req, res) => {
    const {
      jwt: { userId },
    } = req.body;

    const newPost = await Post.create(
      {
        ...pick(req.body, ['title', 'text']),
        UserId: userId,
      },
      { include: User.Posts }
    );

    return res.status(201).json({
      success: true,
      message: SUCCESSFULLY_CREATED,
      data: { id: newPost.id },
    });
  })
);

router.get(
  '/',
  requiresAuth(),
  asyncWrapper(async (req, res) => {
    const {
      jwt: { userId },
    } = req.body;

    const posts = await Post.findAll({ where: { UserId: userId } });

    return res.status(201).json({
      success: true,
      message: SUCCESSFULLY_CREATED,
      data: posts,
    });
  })
);

export default router;

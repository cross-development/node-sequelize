// Packages
import { Router } from 'express';
// Models
import models from '../models';
// Utils
import JWTUtils from '../utils/jwtUtils';
import asyncWrapper from '../utils/asyncWrapper';
// Middleware
import requiresAuth from '../middleware/requiresAuth';
// Helpers
import {
  OK_RESPONSE,
  INVALID_TOKEN,
  INVALID_USERNAME_OR_PASSWORD,
} from '../helpers/responseMessages';

const router = Router();

const { User, RefreshToken } = models;

router.post(
  '/sign-in',
  asyncWrapper(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user || !(await user.comparePasswords(password))) {
      return res
        .status(401)
        .json({ success: false, message: INVALID_USERNAME_OR_PASSWORD });
    }

    const payload = { userId: user.id };
    const accessToken = JWTUtils.generateAccessToken(payload);
    const savedRefreshToken = await user.getRefreshToken();

    let refreshToken;

    if (!savedRefreshToken || !savedRefreshToken.token) {
      refreshToken = JWTUtils.generateRefreshToken(payload);

      if (!savedRefreshToken) {
        await user.createRefreshToken({ token: refreshToken });
      } else {
        savedRefreshToken.token = refreshToken;
        await savedRefreshToken.save();
      }
    } else {
      refreshToken = savedRefreshToken.token;
    }

    return res.status(200).json({
      success: true,
      message: OK_RESPONSE,
      data: {
        userId: user.id,
        tokens: { accessToken, refreshToken },
      },
    });
  })
);

router.post(
  '/sign-out',
  requiresAuth(),
  asyncWrapper(async (req, res) => {
    const {
      jwt: { userId },
    } = req.body;

    const user = await User.findByPk(userId, { include: RefreshToken });

    user.RefreshToken.token = null;
    await user.RefreshToken.save();

    return res.status(200).json({ success: true, message: OK_RESPONSE });
  })
);

router.post(
  '/tokens',
  requiresAuth('refreshToken'),
  asyncWrapper(async (req, res) => {
    const {
      jwt: { userId },
    } = req.body;

    const user = await User.findByPk(userId, { include: RefreshToken });
    const savedToken = user.RefreshToken;

    if (!savedToken || !savedToken.token) {
      return res.status(401).json({ success: false, message: INVALID_TOKEN });
    }

    const payload = { userId: user.id };
    const newAccessToken = JWTUtils.generateAccessToken(payload);
    const newRefreshToken = JWTUtils.generateRefreshToken(payload);

    return res.status(200).json({
      success: true,
      message: OK_RESPONSE,
      data: {
        userId: user.id,
        tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      },
    });
  })
);

export default router;

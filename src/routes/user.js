// Packages
import { Router } from 'express';
import pick from 'lodash.pick';
// Models
import models from '../models';
// Utils
import JWTUtils from '../utils/jwtUtils';
import asyncWrapper from '../utils/asyncWrapper';
// Middleware
import requiresAuth from '../middleware/requiresAuth';
// Helpers
import {
  NOT_FOUND,
  OK_RESPONSE,
  EMAIL_ALREADY_REGISTERED,
} from '../helpers/responseMessages';

const router = Router();

const { User, sequelize } = models;

router.post(
  '/sign-up',
  asyncWrapper(async (req, res) => {
    const { email, roles } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user) {
      return res
        .status(409)
        .json({ success: false, message: EMAIL_ALREADY_REGISTERED });
    }

    const newUser = await sequelize.transaction(() => {
      let rolesToSave = [];

      if (roles && Array.isArray(roles)) {
        rolesToSave = roles.map((role) => ({ role }));
      }

      return User.create(
        {
          ...pick(req.body, [
            'email',
            'password',
            'username',
            'firstName',
            'lastName',
          ]),
          Roles: rolesToSave,
          RefreshToken: { token: null },
        },
        { include: [User.RefreshToken, User.Roles] }
      );
    });

    const payload = { userId: newUser.id };
    const accessToken = JWTUtils.generateAccessToken(payload);
    const refreshToken = JWTUtils.generateRefreshToken(payload);

    newUser.RefreshToken.token = refreshToken;
    await newUser.RefreshToken.save();

    return res.status(200).json({
      success: true,
      message: OK_RESPONSE,
      data: {
        userId: newUser.id,
        tokens: { accessToken, refreshToken },
      },
    });
  })
);

router.get(
  '/me',
  requiresAuth(),
  asyncWrapper(async (req, res) => {
    const {
      jwt: { userId },
    } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: NOT_FOUND });
    }

    return res.status(200).json({
      success: true,
      message: OK_RESPONSE,
      data: user.toJSON(),
    });
  })
);

router.patch(
  '/me',
  requiresAuth(),
  asyncWrapper(async (req, res) => {
    const {
      jwt: { userId },
    } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: NOT_FOUND });
    }

    const updatedUser = await user.update(
      pick(req.body, ['email', 'username', 'firstName', 'lastName'])
    );

    return res.status(200).json({
      success: true,
      message: OK_RESPONSE,
      data: updatedUser.toJSON(),
    });
  })
);

export default router;

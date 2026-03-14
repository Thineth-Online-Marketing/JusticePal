import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// @desc    Get all users
// @route   GET /api/users
// @access  Public (Admin in future)
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Public
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firebaseUid, email, name, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      firebaseUid,
      email,
      name,
      role
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

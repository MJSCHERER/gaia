import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { getAllUsers, getUserById, updateUserById, deleteUserById } from './service.js';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await getAllUsers();

  res.json({
    success: true,
    data: users,
  });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await getUserById(id);

  res.json({
    success: true,
    data: user,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const requestingUserId = req.user!.id;

  const user = await updateUserById(id, requestingUserId, req.body);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteUserById(id);

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

import { Router } from 'express';
import { getUsers, getUser, updateUser, deleteUser } from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), getUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;

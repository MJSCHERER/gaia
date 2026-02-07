import { Router } from 'express';
import { getUsers, getUser, updateUser, deleteUser } from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), getUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;

import { Router } from 'express';
import User from '../models/User.model.js';
import { createPersonController } from '../controllers/person.controller.js';

const router = Router();
const ctrl = createPersonController(User);

// GET /api/users               — list all users (query: name, phone, page, limit)
// GET /api/users/phone/:phone  — find by phone number
// GET /api/users/:id           — get user by _id
// POST /api/users              — create user
// PUT /api/users/:id           — update user
// PUT /api/users/:id/gps       — update GPS location
// DELETE /api/users/:id        — delete user

router.get('/', ctrl.getAll);
router.get('/phone/:phone', ctrl.getByPhone);  // before /:id
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id/gps', ctrl.updateGPS);        // before /:id PUT
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;

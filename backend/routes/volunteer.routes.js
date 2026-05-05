import { Router } from 'express';
import Volunteer from '../models/Volunteer.model.js';
import { createPersonController } from '../controllers/person.controller.js';

const router = Router();
const ctrl = createPersonController(Volunteer);

// GET /api/volunteers               — list all volunteers (query: name, phone, page, limit)
// GET /api/volunteers/phone/:phone  — find by phone number
// GET /api/volunteers/:id           — get volunteer by _id
// POST /api/volunteers              — create volunteer
// PUT /api/volunteers/:id           — update volunteer
// PUT /api/volunteers/:id/gps       — update GPS location
// DELETE /api/volunteers/:id        — delete volunteer

router.get('/', ctrl.getAll);
router.get('/phone/:phone', ctrl.getByPhone);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id/gps', ctrl.updateGPS);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;

import { Router } from 'express';
import ResponseTeam from '../models/ResponseTeam.model.js';
import { createPersonController } from '../controllers/person.controller.js';

const router = Router();
const ctrl = createPersonController(ResponseTeam);

// GET /api/response-team                 — list all (query: name, phone, page, limit)
// GET /api/response-team/phone/:phone    — find by phone number
// GET /api/response-team/:id             — get by _id
// POST /api/response-team                — create  (requires: nid, role)
// PUT /api/response-team/:id             — update
// PUT /api/response-team/:id/gps         — update GPS location
// DELETE /api/response-team/:id          — delete

router.get('/', ctrl.getAll);
router.get('/phone/:phone', ctrl.getByPhone);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id/gps', ctrl.updateGPS);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;

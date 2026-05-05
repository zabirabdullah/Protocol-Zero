import { Router } from 'express';
import Reporter from '../models/Reporter.model.js';
import { createPersonController } from '../controllers/person.controller.js';

const router = Router();
const ctrl = createPersonController(Reporter);

// GET /api/reporters               — list all reporters (query: name, phone, page, limit)
// GET /api/reporters/phone/:phone  — find by phone number
// GET /api/reporters/:id           — get reporter by _id
// POST /api/reporters              — create reporter  (requires: nid)
// PUT /api/reporters/:id           — update reporter
// PUT /api/reporters/:id/gps       — update GPS location
// DELETE /api/reporters/:id        — delete reporter

router.get('/', ctrl.getAll);
router.get('/phone/:phone', ctrl.getByPhone);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id/gps', ctrl.updateGPS);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;

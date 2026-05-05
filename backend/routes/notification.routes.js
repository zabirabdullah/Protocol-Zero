import { Router } from 'express';
import {
  getAllNotifications,
  getNotificationById,
  getByRecipient,
  createNotification,
  updateNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllByRecipient,
} from '../controllers/notification.controller.js';

const router = Router();

// ─── Collection-level ────────────────────────────────────────────────────────
// GET  /api/notifications           — list all (query: read, type, page, limit)
// POST /api/notifications           — create notification
router.get('/', getAllNotifications);
router.post('/', createNotification);

// ─── Recipient-scoped ────────────────────────────────────────────────────────
// GET    /api/notifications/recipient/:recipientId          — all notifications for a person
//        (query: read=false&page=1&limit=20)
// PUT    /api/notifications/recipient/:recipientId/read-all — mark all as read
// DELETE /api/notifications/recipient/:recipientId          — delete all for recipient
router.get('/recipient/:recipientId', getByRecipient);
router.put('/recipient/:recipientId/read-all', markAllAsRead);
router.delete('/recipient/:recipientId', deleteAllByRecipient);

// ─── Single notification ─────────────────────────────────────────────────────
// GET    /api/notifications/:id      — get by _id
// PUT    /api/notifications/:id      — update (any field)
// PUT    /api/notifications/:id/read — mark as read
// DELETE /api/notifications/:id      — delete
router.get('/:id', getNotificationById);
router.put('/:id/read', markAsRead);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);

export default router;

import { Router } from 'express';
import {
  getAllMajorReports,
  getMajorReportById,
  getMajorReportByPostId,
  createMajorReport,
  updateMajorReport,
  deleteMajorReport,
  voteMajorReport,
  addComment,
  deleteComment,
  addLocation,
  removeLocation,
} from '../controllers/majorReport.controller.js';

const router = Router();

// ─── Core CRUD ────────────────────────────────────────────────────────────────
// GET  /api/major-reports              — list all (query: status, category, reliability, page, limit)
// GET  /api/major-reports/post/:postid — get by custom postid
// GET  /api/major-reports/:id          — get by MongoDB _id
// POST /api/major-reports              — create new major report
// PUT  /api/major-reports/:id          — update major report
// DELETE /api/major-reports/:id        — delete major report

router.get('/', getAllMajorReports);
router.get('/post/:postid', getMajorReportByPostId);  // before /:id
router.get('/:id', getMajorReportById);
router.post('/', createMajorReport);
router.put('/:id', updateMajorReport);
router.delete('/:id', deleteMajorReport);

// ─── Voting ───────────────────────────────────────────────────────────────────
// POST /api/major-reports/:id/vote
// Body: { action: "upvote" | "downvote", userId }
router.post('/:id/vote', voteMajorReport);

// ─── Comments ─────────────────────────────────────────────────────────────────
// POST   /api/major-reports/:id/comments              — add comment
// Body:  { text, commenterId }
// DELETE /api/major-reports/:id/comments/:commentId   — delete a comment
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

// ─── Location management ──────────────────────────────────────────────────────
// POST   /api/major-reports/:id/locations             — add a location zone
// Body:  { longitude, latitude, radius }
// DELETE /api/major-reports/:id/locations/:locationIndex — remove by 0-based index
router.post('/:id/locations', addLocation);
router.delete('/:id/locations/:locationIndex', removeLocation);

export default router;

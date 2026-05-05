import { Router } from 'express';
import {
  getAllMinorReports,
  getMinorReportById,
  getMinorReportByPostId,
  createMinorReport,
  updateMinorReport,
  deleteMinorReport,
  voteMinorReport,
  addComment,
  deleteComment,
} from '../controllers/minorReport.controller.js';

const router = Router();

// ─── Core CRUD ────────────────────────────────────────────────────────────────
// GET  /api/minor-reports              — list all (query: status, category, reliability, page, limit)
// GET  /api/minor-reports/post/:postid — get by custom postid
// GET  /api/minor-reports/:id          — get by MongoDB _id
// POST /api/minor-reports              — create new minor report
// PUT  /api/minor-reports/:id          — update minor report
// DELETE /api/minor-reports/:id        — delete minor report

router.get('/', getAllMinorReports);
router.get('/post/:postid', getMinorReportByPostId);  // before /:id
router.get('/:id', getMinorReportById);
router.post('/', createMinorReport);
router.put('/:id', updateMinorReport);
router.delete('/:id', deleteMinorReport);

// ─── Voting ───────────────────────────────────────────────────────────────────
// POST /api/minor-reports/:id/vote
// Body: { action: "upvote" | "downvote", userId }
router.post('/:id/vote', voteMinorReport);

// ─── Comments ─────────────────────────────────────────────────────────────────
// POST   /api/minor-reports/:id/comments               — add comment
// Body:  { text, commenterId }
// DELETE /api/minor-reports/:id/comments/:commentId    — delete a comment
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

export default router;

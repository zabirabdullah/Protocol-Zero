import MinorReport from '../models/MinorReport.model.js';

// ─── GET all ──────────────────────────────────────────────────────────────────
// Query params: ?status=active&category=fire&page=1&limit=20
export const getAllMinorReports = async (req, res) => {
  try {
    const { status, category, reliability, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (reliability) filter.reliability = reliability;

    const skip = (Number(page) - 1) * Number(limit);
    const [docs, total] = await Promise.all([
      MinorReport.find(filter)
        .sort({ time: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('issuerId', 'name phone')
        .populate('updaterId', 'name phone')
        .lean({ virtuals: true }),
      MinorReport.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), limit: Number(limit), data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET by MongoDB _id ───────────────────────────────────────────────────────
export const getMinorReportById = async (req, res) => {
  try {
    const doc = await MinorReport.findById(req.params.id)
      .populate('issuerId', 'name phone')
      .populate('updaterId', 'name phone')
      .populate('victims', 'name phone')
      .lean({ virtuals: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Minor report not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET by postid ────────────────────────────────────────────────────────────
export const getMinorReportByPostId = async (req, res) => {
  try {
    const doc = await MinorReport.findOne({ postid: req.params.postid })
      .populate('issuerId', 'name phone')
      .populate('victims', 'name phone')
      .lean({ virtuals: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Minor report not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST create ──────────────────────────────────────────────────────────────
// Body: { postid, issuerId, location: {longitude, latitude}, time, category, description, image?, victims? }
export const createMinorReport = async (req, res) => {
  try {
    const body = { ...req.body };
    // Accept { longitude, latitude } shorthand and convert to GeoJSON
    if (body.longitude !== undefined && body.latitude !== undefined) {
      body.location = { type: 'Point', coordinates: [Number(body.longitude), Number(body.latitude)] };
      delete body.longitude;
      delete body.latitude;
    }
    const doc = await MinorReport.create(body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'postid already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PUT update ───────────────────────────────────────────────────────────────
export const updateMinorReport = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.longitude !== undefined && body.latitude !== undefined) {
      body.location = { type: 'Point', coordinates: [Number(body.longitude), Number(body.latitude)] };
      delete body.longitude;
      delete body.latitude;
    }
    const doc = await MinorReport.findByIdAndUpdate(
      req.params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Minor report not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const deleteMinorReport = async (req, res) => {
  try {
    const doc = await MinorReport.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Minor report not found' });
    res.json({ success: true, message: 'Minor report deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST vote ────────────────────────────────────────────────────────────────
// Body: { action: 'upvote' | 'downvote', userId }
export const voteMinorReport = async (req, res) => {
  try {
    const { action, userId } = req.body;
    if (!action || !userId)
      return res.status(400).json({ success: false, message: 'action and userId are required' });
    if (!['upvote', 'downvote'].includes(action))
      return res.status(400).json({ success: false, message: 'action must be upvote or downvote' });

    const report = await MinorReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Minor report not found' });

    const alreadyUpvoted = report.vote.upvoterIds.map(String).includes(String(userId));
    const alreadyDownvoted = report.vote.downvoterIds.map(String).includes(String(userId));

    if (action === 'upvote') {
      if (alreadyUpvoted)
        return res.status(409).json({ success: false, message: 'Already upvoted' });
      // Remove from downvote if switching
      if (alreadyDownvoted) {
        report.vote.downvote -= 1;
        report.vote.downvoterIds.pull(userId);
      }
      report.vote.upvote += 1;
      report.vote.upvoterIds.push(userId);
    } else {
      if (alreadyDownvoted)
        return res.status(409).json({ success: false, message: 'Already downvoted' });
      if (alreadyUpvoted) {
        report.vote.upvote -= 1;
        report.vote.upvoterIds.pull(userId);
      }
      report.vote.downvote += 1;
      report.vote.downvoterIds.push(userId);
    }

    await report.save();
    res.json({
      success: true,
      vote: { upvote: report.vote.upvote, downvote: report.vote.downvote },
      score: report.score,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST add comment ────────────────────────────────────────────────────────
// Body: { text, commenterId }
export const addComment = async (req, res) => {
  try {
    const { text, commenterId } = req.body;
    if (!text || !commenterId)
      return res.status(400).json({ success: false, message: 'text and commenterId are required' });

    const doc = await MinorReport.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { text, commenterId } } },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Minor report not found' });
    res.status(201).json({ success: true, comments: doc.comments });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── DELETE comment ───────────────────────────────────────────────────────────
export const deleteComment = async (req, res) => {
  try {
    const doc = await MinorReport.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    ).lean({ virtuals: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Minor report not found' });
    res.json({ success: true, comments: doc.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

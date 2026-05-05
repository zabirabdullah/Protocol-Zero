import MajorReport from '../models/MajorReport.model.js';

// ─── GET all ──────────────────────────────────────────────────────────────────
// Query params: ?status=active&category=flood&page=1&limit=20
export const getAllMajorReports = async (req, res) => {
  try {
    const { status, category, reliability, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (reliability) filter.reliability = reliability;

    const skip = (Number(page) - 1) * Number(limit);
    const [docs, total] = await Promise.all([
      MajorReport.find(filter)
        .sort({ time: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('issuerId', 'name phone')
        .lean({ virtuals: true }),
      MajorReport.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), limit: Number(limit), data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET by MongoDB _id ───────────────────────────────────────────────────────
export const getMajorReportById = async (req, res) => {
  try {
    const doc = await MajorReport.findById(req.params.id)
      .populate('issuerId', 'name phone')
      .populate('victims', 'name phone')
      .lean({ virtuals: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Major report not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET by postid ────────────────────────────────────────────────────────────
export const getMajorReportByPostId = async (req, res) => {
  try {
    const doc = await MajorReport.findOne({ postid: req.params.postid })
      .populate('issuerId', 'name phone')
      .populate('victims', 'name phone')
      .lean({ virtuals: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Major report not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST create ──────────────────────────────────────────────────────────────
// Body: {
//   postid, issuerId, time, category, description, image?, victims?,
//   locations: [{ longitude, latitude, radius }]   ← shorthand accepted
// }
export const createMajorReport = async (req, res) => {
  try {
    const body = { ...req.body };
    // Convert shorthand location array to GeoJSON
    if (Array.isArray(body.locations)) {
      body.locations = body.locations.map((loc) => ({
        coordinate:
          loc.longitude !== undefined && loc.latitude !== undefined
            ? { type: 'Point', coordinates: [Number(loc.longitude), Number(loc.latitude)] }
            : loc.coordinate,
        radius: loc.radius,
      }));
    }
    const doc = await MajorReport.create(body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'postid already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PUT update ───────────────────────────────────────────────────────────────
export const updateMajorReport = async (req, res) => {
  try {
    const body = { ...req.body };
    if (Array.isArray(body.locations)) {
      body.locations = body.locations.map((loc) => ({
        coordinate:
          loc.longitude !== undefined && loc.latitude !== undefined
            ? { type: 'Point', coordinates: [Number(loc.longitude), Number(loc.latitude)] }
            : loc.coordinate,
        radius: loc.radius,
      }));
    }
    const doc = await MajorReport.findByIdAndUpdate(
      req.params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Major report not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const deleteMajorReport = async (req, res) => {
  try {
    const doc = await MajorReport.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Major report not found' });
    res.json({ success: true, message: 'Major report deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST vote ────────────────────────────────────────────────────────────────
// Body: { action: 'upvote' | 'downvote', userId }
export const voteMajorReport = async (req, res) => {
  try {
    const { action, userId } = req.body;
    if (!action || !userId)
      return res.status(400).json({ success: false, message: 'action and userId are required' });
    if (!['upvote', 'downvote'].includes(action))
      return res.status(400).json({ success: false, message: 'action must be upvote or downvote' });

    const report = await MajorReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Major report not found' });

    const alreadyUpvoted = report.vote.upvoterIds.map(String).includes(String(userId));
    const alreadyDownvoted = report.vote.downvoterIds.map(String).includes(String(userId));

    if (action === 'upvote') {
      if (alreadyUpvoted)
        return res.status(409).json({ success: false, message: 'Already upvoted' });
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

// ─── POST add comment ─────────────────────────────────────────────────────────
// Body: { text, commenterId }
export const addComment = async (req, res) => {
  try {
    const { text, commenterId } = req.body;
    if (!text || !commenterId)
      return res.status(400).json({ success: false, message: 'text and commenterId are required' });

    const doc = await MajorReport.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { text, commenterId } } },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Major report not found' });
    res.status(201).json({ success: true, comments: doc.comments });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── DELETE comment ───────────────────────────────────────────────────────────
export const deleteComment = async (req, res) => {
  try {
    const doc = await MajorReport.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    ).lean({ virtuals: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Major report not found' });
    res.json({ success: true, comments: doc.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST add location ────────────────────────────────────────────────────────
// Body: { longitude, latitude, radius }
export const addLocation = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.body;
    if (longitude === undefined || latitude === undefined || radius === undefined)
      return res.status(400).json({ success: false, message: 'longitude, latitude and radius are required' });

    const newLocation = {
      coordinate: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
      radius: Number(radius),
    };
    const doc = await MajorReport.findByIdAndUpdate(
      req.params.id,
      { $push: { locations: newLocation } },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Major report not found' });
    res.status(201).json({ success: true, locations: doc.locations });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── DELETE a specific location entry ─────────────────────────────────────────
// Param: :locationIndex (0-based index)
export const removeLocation = async (req, res) => {
  try {
    const report = await MajorReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Major report not found' });

    const idx = Number(req.params.locationIndex);
    if (isNaN(idx) || idx < 0 || idx >= report.locations.length)
      return res.status(400).json({ success: false, message: 'Invalid location index' });

    report.locations.splice(idx, 1);
    await report.save();
    res.json({ success: true, locations: report.locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

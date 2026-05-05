import Notification from '../models/Notification.model.js';

// ─── GET all ──────────────────────────────────────────────────────────────────
// Query params: ?read=false&type=flood&page=1&limit=20
export const getAllNotifications = async (req, res) => {
  try {
    const { read, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (read !== undefined) filter.read = read === 'true';
    if (type) filter.type = { $regex: type, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [docs, total] = await Promise.all([
      Notification.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('recipientId', 'name phone')
        .lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), limit: Number(limit), data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET by notification _id ──────────────────────────────────────────────────
export const getNotificationById = async (req, res) => {
  try {
    const doc = await Notification.findById(req.params.id)
      .populate('recipientId', 'name phone')
      .lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET all notifications for a recipient ────────────────────────────────────
// Query params: ?read=false&page=1&limit=20
export const getByRecipient = async (req, res) => {
  try {
    const { read, page = 1, limit = 20 } = req.query;
    const filter = { recipientId: req.params.recipientId };
    if (read !== undefined) filter.read = read === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [docs, total] = await Promise.all([
      Notification.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('referenceId')
        .lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), limit: Number(limit), data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST create ──────────────────────────────────────────────────────────────
// Body: { recipientId, referenceId, referenceModel, type, message }
export const createNotification = async (req, res) => {
  try {
    const doc = await Notification.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PUT update (mark read, change message, etc.) ────────────────────────────
export const updateNotification = async (req, res) => {
  try {
    const doc = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PUT mark one as read ─────────────────────────────────────────────────────
export const markAsRead = async (req, res) => {
  try {
    const doc = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { read: true } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT mark all as read for a recipient ────────────────────────────────────
export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipientId: req.params.recipientId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const deleteNotification = async (req, res) => {
  try {
    const doc = await Notification.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE all notifications for a recipient ─────────────────────────────────
export const deleteAllByRecipient = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ recipientId: req.params.recipientId });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

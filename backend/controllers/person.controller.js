/**
 * createPersonController
 * Factory that generates standard CRUD handlers for any Person discriminator.
 * Usage: const ctrl = createPersonController(UserModel);
 */
export const createPersonController = (Model) => {
  const modelName = Model.modelName;

  // ─── GET all ───────────────────────────────────────────────────────────────
  // Query params: ?name=&phone=&page=1&limit=20
  const getAll = async (req, res) => {
    try {
      const { name, phone, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (name) filter.name = { $regex: name, $options: 'i' };
      if (phone) filter.phone = { $regex: phone, $options: 'i' };

      const skip = (Number(page) - 1) * Number(limit);
      const [docs, total] = await Promise.all([
        Model.find(filter).skip(skip).limit(Number(limit)).lean(),
        Model.countDocuments(filter),
      ]);

      res.json({
        success: true,
        total,
        page: Number(page),
        limit: Number(limit),
        data: docs,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // ─── GET by ID ────────────────────────────────────────────────────────────
  const getById = async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id).lean();
      if (!doc)
        return res.status(404).json({ success: false, message: `${modelName} not found` });
      res.json({ success: true, data: doc });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // ─── GET by phone ─────────────────────────────────────────────────────────
  const getByPhone = async (req, res) => {
    try {
      const doc = await Model.findOne({ phone: req.params.phone }).lean();
      if (!doc)
        return res.status(404).json({ success: false, message: `${modelName} not found` });
      res.json({ success: true, data: doc });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // ─── POST create ─────────────────────────────────────────────────────────
  const create = async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Duplicate key — phone number already registered',
          field: Object.keys(err.keyPattern)[0],
        });
      }
      res.status(400).json({ success: false, message: err.message });
    }
  };

  // ─── PUT update ───────────────────────────────────────────────────────────
  const update = async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!doc)
        return res.status(404).json({ success: false, message: `${modelName} not found` });
      res.json({ success: true, data: doc });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Duplicate key — phone number already registered',
        });
      }
      res.status(400).json({ success: false, message: err.message });
    }
  };

  // ─── DELETE ───────────────────────────────────────────────────────────────
  const remove = async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc)
        return res.status(404).json({ success: false, message: `${modelName} not found` });
      res.json({ success: true, message: `${modelName} deleted successfully` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // ─── UPDATE GPS location ───────────────────────────────────────────────────
  // Body: { longitude, latitude }
  const updateGPS = async (req, res) => {
    try {
      const { longitude, latitude } = req.body;
      if (longitude === undefined || latitude === undefined) {
        return res.status(400).json({ success: false, message: 'longitude and latitude are required' });
      }
      const doc = await Model.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            gps: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
          },
        },
        { new: true, runValidators: true }
      );
      if (!doc)
        return res.status(404).json({ success: false, message: `${modelName} not found` });
      res.json({ success: true, data: doc });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  return { getAll, getById, getByPhone, create, update, remove, updateGPS };
};

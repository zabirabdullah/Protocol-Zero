import mongoose from 'mongoose';

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    // The person receiving this notification (any actor in the persons collection)
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'Recipient ID is required'],
    },

    // Polymorphic reference: points to either MinorReport or MajorReport
    referenceId: {
      type: Schema.Types.ObjectId,
      refPath: 'referenceModel',
      required: [true, 'Reference ID is required'],
    },
    // Companion field for refPath — tells Mongoose which model to populate from
    referenceModel: {
      type: String,
      enum: {
        values: ['MinorReport', 'MajorReport'],
        message: 'referenceModel must be MinorReport or MajorReport',
      },
      required: [true, 'Reference model type is required'],
    },

    // Category of the referenced report
    type: {
      type: String,
      required: [true, 'Notification type (category) is required'],
      trim: true,
    },

    // Description/message from the referenced report
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },

    read: {
      type: Boolean,
      default: false,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // We use a manual timestamp field, so disable Mongoose's auto timestamps
    // to avoid duplicate createdAt/updatedAt confusion.
    timestamps: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Fast lookup: "give me all notifications for this recipient"
NotificationSchema.index({ recipientId: 1 });
// Fast sort by recency
NotificationSchema.index({ timestamp: -1 });
// Compound: unread notifications for a recipient (common query)
NotificationSchema.index({ recipientId: 1, read: 1, timestamp: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;

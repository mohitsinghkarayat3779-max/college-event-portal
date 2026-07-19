const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    bannerImage: { type: String, default: '' }, // URL
    date: { type: Date, required: true }, // event date
    time: { type: String, required: true }, // e.g. "5:00 PM"
    venue: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'],
      default: 'Other',
    },
    registrationDeadline: { type: Date, required: true },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Virtual: is registration still open?
eventSchema.virtual('isRegistrationOpen').get(function () {
  return new Date() < this.registrationDeadline && this.availableSeats > 0;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);

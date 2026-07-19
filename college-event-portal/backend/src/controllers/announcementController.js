const Announcement = require('../models/Announcement');

// @route GET /api/announcements (public/students)
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate('event', 'title')
      .populate('createdBy', 'name');
    res.json(announcements);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/announcements (admin only)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, event } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    const announcement = await Announcement.create({
      title,
      message,
      event: event || null,
      createdBy: req.user._id,
    });
    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/announcements/:id (admin only)
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };

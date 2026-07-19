const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @route GET /api/events
// Supports: ?search=&category=&status=upcoming|past
const getEvents = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (status === 'upcoming') {
      filter.date = { $gte: new Date() };
    } else if (status === 'past') {
      filter.date = { $lt: new Date() };
    }

    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/events/:id
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/events (admin only)
const createEvent = async (req, res, next) => {
  try {
    const {
      title, description, bannerImage, date, time, venue,
      category, registrationDeadline, totalSeats,
    } = req.body;

    if (!title || !description || !date || !time || !venue || !registrationDeadline || !totalSeats) {
      return res.status(400).json({ message: 'Missing required event fields' });
    }

    const event = await Event.create({
      title, description, bannerImage, date, time, venue, category,
      registrationDeadline,
      totalSeats,
      availableSeats: totalSeats,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/events/:id (admin only)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const seatDelta =
      req.body.totalSeats !== undefined ? Number(req.body.totalSeats) - event.totalSeats : 0;

    Object.assign(event, req.body);

    // Keep availableSeats in sync if totalSeats changed
    if (seatDelta !== 0) {
      event.availableSeats = Math.max(0, event.availableSeats + seatDelta);
    }

    await event.save();
    res.json(event);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/events/:id (admin only)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await event.deleteOne();
    await Registration.deleteMany({ event: event._id });
    res.json({ message: 'Event and its registrations deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };

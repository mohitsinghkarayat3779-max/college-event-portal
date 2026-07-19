const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @route POST /api/registrations/:eventId  (student)
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check for an existing (possibly cancelled) registration first
    let registration = await Registration.findOne({ user: req.user._id, event: eventId });
    if (registration && registration.status === 'registered') {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Atomically claim a seat: only succeeds if availableSeats > 0
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gt: 0 } },
      { $inc: { availableSeats: -1 } },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(400).json({ message: 'No seats available for this event' });
    }

    if (registration) {
      registration.status = 'registered';
      await registration.save();
    } else {
      registration = await Registration.create({ user: req.user._id, event: eventId });
    }

    res.status(201).json(registration);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/registrations/:eventId  (student cancels own registration)
const cancelRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const registration = await Registration.findOne({
      user: req.user._id,
      event: eventId,
      status: 'registered',
    });
    if (!registration) return res.status(404).json({ message: 'Active registration not found' });

    registration.status = 'cancelled';
    await registration.save();

    // Return the seat to the pool (cap at totalSeats just in case)
    const event = await Event.findById(eventId);
    if (event) {
      event.availableSeats = Math.min(event.totalSeats, event.availableSeats + 1);
      await event.save();
    }

    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/registrations/my  (student's own registrations)
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
      status: 'registered',
    }).populate('event');
    res.json(registrations);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/registrations/event/:eventId  (admin: list registrants for an event)
const getEventRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({
      event: req.params.eventId,
      status: 'registered',
    }).populate('user', 'name email');
    res.json(registrations);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
};

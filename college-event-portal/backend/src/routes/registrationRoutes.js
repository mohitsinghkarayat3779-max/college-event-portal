const express = require('express');
const {
  registerForEvent, cancelRegistration, getMyRegistrations, getEventRegistrations,
} = require('../controllers/registrationController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, getMyRegistrations);
router.get('/event/:eventId', protect, adminOnly, getEventRegistrations);
router.post('/:eventId', protect, registerForEvent);
router.delete('/:eventId', protect, cancelRegistration);

module.exports = router;

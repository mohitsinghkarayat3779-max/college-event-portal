const express = require('express');
const {
  getAnnouncements, createAnnouncement, deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAnnouncements);
router.post('/', protect, adminOnly, createAnnouncement);
router.delete('/:id', protect, adminOnly, deleteAnnouncement);

module.exports = router;

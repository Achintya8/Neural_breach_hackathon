const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const accessControl = require('../middleware/accessControl');

// @route   POST api/resources
// @desc    Upload a resource
// @access  Private
router.post('/', [auth, upload.single('file')], resourceController.createResource);

// @route   GET api/resources
// @desc    Get all resources (filtered by access)
// @access  Private (Need to know user's college)
router.get('/', auth, resourceController.getResources);

// @route   GET api/resources/:id
// @desc    Get single resource details
// @access  Private
router.get('/:id', [auth, accessControl], resourceController.getResourceById);

// @route   GET api/resources/download/:id
// @desc    Get download link
// @access  Private
router.get('/download/:id', [auth, accessControl], resourceController.downloadResource);

// @route   DELETE api/resources/:id
// @desc    Delete resource
// @access  Private
router.delete('/:id', auth, resourceController.deleteResource);

module.exports = router;

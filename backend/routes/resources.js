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

// @route   GET api/resources/my-resources
// @desc    Get current user's uploaded resources
// @access  Private
router.get('/my-resources', auth, resourceController.getMyResources);

// @route   PUT api/resources/:id
// @desc    Update a resource
// @access  Private
router.put('/:id', auth, resourceController.updateResource);

// @route   GET api/resources/:id
// @desc    Get single resource details
// @access  Private
router.get('/:id', [auth, accessControl], resourceController.getResourceById);

// @route   GET api/resources/preview/:id
// @desc    Get preview link
// @access  Private
router.get('/preview/:id', [auth, accessControl], resourceController.previewResource);

// @route   GET api/resources/download/:id
// @desc    Get download link
// @access  Private
router.get('/download/:id', [auth, accessControl], resourceController.downloadResource);

// @route   DELETE api/resources/:id
// @desc    Delete resource
// @access  Private
router.delete('/:id', auth, resourceController.deleteResource);

// @route   POST api/resources/:id/reviews
// @desc    Add a review
// @access  Private
router.post('/:id/reviews', auth, accessControl, resourceController.addReview);

// @route   GET api/resources/:id/reviews
// @desc    Get reviews for a resource
// @access  Private
router.get('/:id/reviews', auth, accessControl, resourceController.getReviews);

module.exports = router;

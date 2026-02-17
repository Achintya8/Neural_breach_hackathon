const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const auth = require('../middleware/auth');

// @route   POST api/collections
// @desc    Create a collection
// @access  Private
router.post('/', auth, collectionController.createCollection);

// @route   GET api/collections
// @desc    Get collections (my + public)
// @access  Private
router.get('/', auth, collectionController.getCollections);

// @route   GET api/collections/:id
// @desc    Get single collection details
// @access  Private (Public if privacy=PUBLIC)
router.get('/:id', auth, collectionController.getCollectionById);

// @route   DELETE api/collections/:id
// @desc    Delete a collection
// @access  Private
router.delete('/:id', auth, collectionController.deleteCollection);

// @route   POST api/collections/:id/resources
// @desc    Add resource to collection
// @access  Private
router.post('/:id/resources', auth, collectionController.addResource);

// @route   DELETE api/collections/:id/resources/:resourceId
// @desc    Remove resource from collection
// @access  Private
router.delete('/:id/resources/:resourceId', auth, collectionController.removeResource);

module.exports = router;

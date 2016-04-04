'use strict';

var express = require('express');
var controller = require('./thing.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
// router.get('/', auth.isAuthenticated(), controller.getTweet);
router.get('/:id', controller.show);
// router.get('/:id',twitterController.getTweet,controller.show);
// router.post('/', auth.isAuthenticated(), controller.create);
router.post('/', controller.getTweet, controller.index);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);


//add star and delete star as favourite
//
router.put('/:id/star', auth.isAuthenticated(), controller.star);
router.delete('/:id/star', auth.isAuthenticated(), controller.unstar);

module.exports = router;

'use strict';

var express = require('express');
var controller = require('./thing.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.getTweet, controller.index);
// router.get('/api/things/?keyword', auth.isAuthenticated(), controller.indexKeyword);
// router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(), controller.postTweet);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', auth.isAuthenticated(), controller.destroy);


//add star and delete star as favourite
//
// router.put('/:id/star', auth.isAuthenticated(), controller.star);
// router.delete('/:id/star', auth.isAuthenticated(), controller.unstar);

module.exports = router;

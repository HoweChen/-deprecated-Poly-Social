/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/things              ->  index
 * POST    /api/things              ->  create
 * GET     /api/things/:id          ->  show
 * PUT     /api/things/:id          ->  update
 * DELETE  /api/things/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Thing from './thing.model';
import mongoose from 'mongoose';

var Twitter = require('twitter');

//set up the user's twitter token and token secret
var twitterClient = new Twitter({
  consumer_key: 'YWhfVLPloADYwOMH0EebIJZW6',
  consumer_secret: 'WLvtY4ijO224mjvCzZHqgZZfqvhvR1NhXQvTQ1cWPRIsRVLKFW',
  access_token_key: '330958702-wnc1azXDPfkDJRsWWDGuovDQ7L6PZRpzNR3KqPsY',
  access_token_secret: 'E88aQcJkPLtgpVFEFitOtGA37u5oMm5SgLD3lHM0qZfRo'
});


function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

//check if the user is authorized
function handleUnauthorized(req, res) {
  return function (entity) {
    if (!entity) {
      return null;
    }
    if (entity.user._id.toString() !== req.user._id.toString()) {
      res.send(403).end();
      return null;
    }
    return entity;
  }
}

//check if the tweet is inside the database
function isFound(tweet) {
  Thing.findOne({
    'twitterTimeline.id_str': tweet.id_str
  }, function (err, exist) {
    if (exist && !err) {
      return true;
    } else {
      var newTweet = new Thing();
      newTweet.twitterTimeline = tweet;
      //   newTweet.createdAt = tweet.created_at;
      newTweet.save();
      return false;
    }
  });
  return false;
}

// Gets a list of Things
export function index(req, res) {
  var keyword = decodeURIComponent(req.query.keyword);
  if (keyword !== undefined) {
    //with keyword
    return Thing.find({
        $or: [{
          'twitterTimeline.user.name': {
            $regex: keyword,
            $options: 'i'
          }
        }, {
          'twitterTimeline.text': {
            $regex: keyword
          }
        }]
      }).sort({
        createdAt: 1
      }).exec()
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    //without keyword
    return Thing.find().sort({
        createdAt: -1
      }).exec()
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

}

// export function indexKeyword(req, res) {
//   console.log(req.params);
//   console.log(req.query.keyword);
//   console.log("Fuck you");
// }

// Gets a single Thing from the DB
export function show(req, res) {
  // return Thing.findById(req.params.id).exec()
  //   .then(handleEntityNotFound(res))
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));
}

// Creates a new Thing in the DB
export function create(req, res) {
  req.body.user = req.user;
  return Thing.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Thing in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Thing.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Thing from the DB
export function destroy(req, res) {

  return Thing.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(handleUnauthorized(req, res)) //check if the user is authorized before delete the thing
    .then(removeEntity(res))
    .catch(handleError(res));
}

//star thing
exports.star = function (req, res) {
  Thing.update({
    _id: req.params.id
  }, {
    $push: {
      stars: req.user._id
    }
  }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
  });
};

//unstar thing
exports.unstar = function (req, res) {
  Thing.update({
    _id: req.params.id
  }, {
    $pull: {
      stars: req.user._id
    }
  }, function (err, num) {
    if (err) {
      return handleError(res)(err);
    }
    if (num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
  });
};

//postTweet
export function postTweet(req, res) {
  // console.log(req);
  //post tweet
  twitterClient.post('statuses/update', {
    status: req.body.name
  }, function (error, tweet, response) {
    if (error) {
      return handleError(res)(error).then(res.end());
    }
  });
  return getTweet(req, res);

}


//getTweet
export function getTweet(req, res) {
  req.body.user = req.user;
  // twitterClient.access_token_key = req.user.twitter.token;
  // twitterClient.access_token_secret = req.user.twitter.tokenSecret;

  var param = {
    user_id: req.user.twitter.id_str,
    count: 100
  };


  Thing.find().sort({
    createdAt: -1
  }).exec()


  //get the tweet
  twitterClient.get('statuses/home_timeline', param, function (error, tweets, response) {
    if (error) {
      console.log(error);
      res.render('error', {
        status: 500
      });
    }
    //else part
    for (var temp = tweets.length - 1; temp >= 0; --temp) {
      var flag = isFound(tweets[temp]);
    }
  });

  return index(req, res);
}

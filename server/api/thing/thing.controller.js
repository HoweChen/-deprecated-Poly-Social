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

var fs = require('fs');
var Twitter = require('twitter');
var Weibo = require('nodeweibo');
var weiboSetting = require('../../auth/weibo/weiboSetting.json');


//set up the user's twitter token and token secret
var twitterClient = new Twitter({
  consumer_key: 'YWhfVLPloADYwOMH0EebIJZW6',
  consumer_secret: 'WLvtY4ijO224mjvCzZHqgZZfqvhvR1NhXQvTQ1cWPRIsRVLKFW',
  access_token_key: '330958702-wnc1azXDPfkDJRsWWDGuovDQ7L6PZRpzNR3KqPsY',
  access_token_secret: 'E88aQcJkPLtgpVFEFitOtGA37u5oMm5SgLD3lHM0qZfRo'
});

var weiboAccessToekn;


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
    'timeline.id_str': tweet.id_str
  }, function (err, exist) {
    if (exist && !err) {
      return true;
    } else {
      var newTweet = new Thing();
      newTweet.timeline = tweet;
      //   newTweet.createdAt = tweet.created_at;
      newTweet.timeline.timelineType = 'Twitter';
      newTweet.timeline.userAvatar = tweet.user.profile_image_url;
      newTweet.save();
      return false;
    }
  });
  return false;
}


//getTweet
export function getTweet(req, res, next) {
  req.body.user = req.user;
  // twitterClient.access_token_key = req.user.twitter.token;
  // twitterClient.access_token_secret = req.user.twitter.tokenSecret;

  var param = {
    user_id: req.user.twitter.id_str,
    count: 100
  };

  //get the tweet
  twitterClient.get('statuses/home_timeline', param, function (error, tweets, response) {
    if (error) {
      console.log(error);
      // res.render('error', {
      //   status: 500
      // });
    } else {
      for (var temp = tweets.length - 1; temp >= 0; --temp) {
        var flag = isFound(tweets[temp]);
      }
    }
  });
  next();
  // return index(req, res);
}

//Gets weibo
export function getWeibo(req, res, next) {
  // 2.00qjRJUB0XENDz1091a55011oViX1E
  Weibo.init(weiboSetting);
  //
  // Weibo.authorize();
  // var jsonParas = {
  //   // client_id: weiboSetting.appKey,
  //   // client_secret: weiboSetting.appSecret,
  //   code: '31d551d64820e8e83f35ad8e1fdc91fe',
  //   grant_type: 'authorization_code'
  // };
  //
  // Weibo.OAuth2.access_token(jsonParas, function (data) {
  //   // weiboSetting.access_token = data.access_token;
  //   console.log(data);
  //   console.log(data.access_token);
  // });
  // console.log(weiboAccessToekn);

  // set parameters
  var para = {
    "source": Weibo.appKey.appKey,
    "access_token": '2.00qjRJUB0XENDz1091a55011oViX1E',
    "count": 100
  };

  // get public timeline
  Weibo.Statuses.home_timeline(para, function (data) {
    for (var temp = data.statuses.length - 1; temp >= 0; --temp) {
      var newWeibo = new Thing();
      newWeibo.timeline = data.statuses[temp];
      //   newTweet.createdAt = tweet.created_at;
      newWeibo.timeline.timelineType = 'Sina Weibo';
      newWeibo.timeline.userAvatar = data.statuses[temp].user.profile_image_url;
      newWeibo.save();
    }
  });

  //test for the time_limit
  // var limitPara = {
  //   "access_token": '2.00qjRJUB0XENDz1091a55011oViX1E'
  // }
  // Weibo.Account.rate_limit_status(limitPara, function (data) {
  //   console.log(data);
  // });
  next();
}

// Gets a list of Things
export function index(req, res) {

  var keyword = decodeURIComponent(req.query.keyword);
  // console.log(keyword);

  return Thing.find({
      $or: [{
        'timeline.user.name': {
          $regex: keyword,
          $options: 'i'
        }
        }, {
        'timeline.text': {
          $regex: keyword
        }
        }]
    }).sort({
      'timeline.created_at': 1
    }).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));

}

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

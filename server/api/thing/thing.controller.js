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
var momentTimezone = require('moment-timezone');


//set up the user's twitter token and token secret
var twitterClient = new Twitter({
  consumer_key: 'YWhfVLPloADYwOMH0EebIJZW6',
  consumer_secret: 'WLvtY4ijO224mjvCzZHqgZZfqvhvR1NhXQvTQ1cWPRIsRVLKFW',
  access_token_key: '330958702-wnc1azXDPfkDJRsWWDGuovDQ7L6PZRpzNR3KqPsY',
  access_token_secret: 'E88aQcJkPLtgpVFEFitOtGA37u5oMm5SgLD3lHM0qZfRo'
});

Weibo.init(weiboSetting);

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
function isFoundTweet(tweet) {
  Thing.findOne({
    'id_str': tweet.id_str
  }, function (err, exist) {
    if (exist && !err) {
      return true;
    } else {
      var newTweet = new Thing();
      newTweet.timeline = tweet;
      newTweet.id_str = tweet.id_str;
      //   newTweet.createdAt = tweet.created_at;
      newTweet.timeline.timelineType = 'Twitter';
      newTweet.timeline.userAvatar = tweet.user.profile_image_url;
      newTweet.timeline_created_at = momentTimezone(tweet.created_at).tz("Asia/Shanghai").format('YYYY/MM/DD hh:mm:ss');
      newTweet.timeline.created_at = momentTimezone(tweet.created_at).tz("Asia/Shanghai")._d.toString();
      newTweet.save();
      return false;
    }
  });
  return false;
}

//check if the weibo is inside the database
function isFoundWeibo(weibo) {
  Thing.findOne({
    'id_str': weibo.idstr
  }, function (err, exist) {
    if (exist && !err) {
      return true;
    } else {
      var newWeibo = new Thing();
      newWeibo.timeline = weibo;
      newWeibo.id_str = weibo.idstr;
      //   newTweet.createdAt = tweet.created_at;
      newWeibo.timeline.timelineType = 'Sina Weibo';
      newWeibo.timeline.userAvatar = weibo.user.profile_image_url;
      newWeibo.timeline_created_at = momentTimezone(weibo.created_at).tz("Asia/Shanghai").format('YYYY/MM/DD hh:mm:ss');
      newWeibo.timeline.created_at = momentTimezone(weibo.created_at).tz("Asia/Shanghai")._d.toString();
      newWeibo.save();
      return false;
    }
  });
  return false;
}

function toObj(str) {
  const a = str.split(/[,\s]+/);
  return a.reduce((p, c) => {
    const kv = c.replace(/'/g, '').split('=');
    p[kv[0]] = kv[1];
    return p;
  }, {});
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
        var flag = isFoundTweet(tweets[temp]);
      }
    }
  });
  next();
  // return index(req, res);
}

//Gets weibo
export function getWeibo(req, res, next) {

  // set parameters
  var para = {
    "source": Weibo.appKey.appKey,
    "access_token": '2.00qjRJUB0XENDz1091a55011oViX1E',
    "count": 100
  };

  // get public timeline
  Weibo.Statuses.home_timeline(para, function (data) {
    for (var temp = data.statuses.length - 1; temp >= 0; --temp) {
      var flag = isFoundWeibo(data.statuses[temp]);
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

export function indexKeyword(req, res) {
  var keyword = decodeURIComponent(req.query.keyword);
  // console.log(keyword.indexOf('USER'));
  if (keyword.indexOf('USER') !== -1 || keyword.indexOf('TEXT') !== -1 || keyword.indexOf('MODE') !== -1 || keyword.indexOf('TYPE') !== -1) {
    //enter the advanced searching model
    var keywordObj = toObj(keyword);
    // keywordObj is an object now
    console.log(keywordObj);
    if (keywordObj.TYPE) {
      if (keywordObj.TYPE === 'Sina Weibo' || keywordObj.TYPE === 'SinaWeibo' || keywordObj.TYPE === 'sinaweibo' || keywordObj.TYPE === 'weibo' || keywordObj.TYPE === 'sina weibo') {
        return Thing.find({
            'timeline.timelineType': 'Sina Weibo'
          }).sort({
            'timeline.created_at': -1
          }).exec()
          .then(handleEntityNotFound(res))
          .then(respondWithResult(res))
          .catch(handleError(res));
      }
      if (keywordObj.TYPE === 'Twitter' || keywordObj.TYPE === 'twitter') {
        return Thing.find({
            'timeline.timelineType': 'Twitter'
          }).sort({
            'timeline.created_at': -1
          }).exec()
          .then(handleEntityNotFound(res))
          .then(respondWithResult(res))
          .catch(handleError(res));
      }
    }
    if (keywordObj.MODE) {
      //keywordObj.MODE exist
      if (keywordObj.MODE === 'AND') {
        if (keywordObj.USER && !keywordObj.TEXT) {
          //with USER only with MODE AND
          // console.log(keywordObj.USER);
          return Thing.find({
              'timeline.user.name': {
                $regex: keywordObj.USER,
                $options: 'i'
              }
            }).sort({
              'timeline.created_at': -1
            }).exec()
            .then(handleEntityNotFound(res))
            .then(respondWithResult(res))
            .catch(handleError(res));
        }
        //with TEXT only with MODE AND
        if (!keywordObj.USER && keywordObj.TEXT) {
          return Thing.find({
              'timeline.text': {
                $regex: keywordObj.TEXT
              }
            }).sort({
              'timeline.created_at': -1
            }).exec()
            .then(handleEntityNotFound(res))
            .then(respondWithResult(res))
            .catch(handleError(res));
        }
        //with both USER and TEXT with MODE AND
        if (keywordObj.USER && keywordObj.TEXT) {
          return Thing.find({
              $AND: [{
                'timeline.user.name': {
                  $regex: keywordObj.USER,
                  $options: 'i'
                }
              }, {
                'timeline.text': {
                  $regex: keywordObj.TEXT
                }
              }]
            }).sort({
              'timeline.created_at': -1
            }).exec()
            .then(handleEntityNotFound(res))
            .then(respondWithResult(res))
            .catch(handleError(res));
        }
      } else if (keywordObj.MODE === 'OR') {
        if (keywordObj.USER && !keywordObj.TEXT) {
          //with USER only with MODE OR
          // console.log(keywordObj.USER);
          return Thing.find({
              'timeline.user.name': {
                $regex: keywordObj.USER,
                $options: 'i'
              }
            }).sort({
              'timeline.created_at': -1
            }).exec()
            .then(handleEntityNotFound(res))
            .then(respondWithResult(res))
            .catch(handleError(res));
        }
        //with TEXT only with MODE OR
        if (!keywordObj.USER && keywordObj.TEXT) {
          return Thing.find({
              'timeline.text': {
                $regex: keywordObj.TEXT
              }
            }).sort({
              'timeline.created_at': -1
            }).exec()
            .then(handleEntityNotFound(res))
            .then(respondWithResult(res))
            .catch(handleError(res));
        }
        //with both USER and TEXT with MODE AND
        if (keywordObj.USER && keywordObj.TEXT) {
          return Thing.find({
              $OR: [{
                'timeline.user.name': {
                  $regex: keywordObj.USER,
                  $options: 'i'
                }
              }, {
                'timeline.text': {
                  $regex: keywordObj.TEXT
                }
              }]
            }).sort({
              'timeline.created_at': -1
            }).exec()
            .then(handleEntityNotFound(res))
            .then(respondWithResult(res))
            .catch(handleError(res));
        }
      } else if (keywordObj.MODE === 'NOT') {
        if (keywordObj.USER && !keywordObj.TEXT) {
          //with USER only with MODE NOT
          // console.log(keywordObj.USER);
          return Thing.find({
              'timeline.user.name': {
                $NOT: {
                  $regex: keywordObj.USER,
                  $options: 'i'
                }
              }
            }).sort({
              'timeline.created_at': -1
            }).exec()
            .then(handleEntityNotFound(res))
            .then(respondWithResult(res))
            .catch(handleError(res));
        }
        //with TEXT only with MODE NOT
        if (!keywordObj.USER && keywordObj.TEXT) {
          return Thing.find({
              'timeline.text': {
                $NOT: {
                  $regex: keywordObj.TEXT
                }
              }
            }).sort({
              'timeline.created_at': -1
            }).exec()
            .then(handleEntityNotFound(res))
            .then(respondWithResult(res))
            .catch(handleError(res));
        }
        //with both USER and TEXT with MODE NOT
        if (keywordObj.USER && keywordObj.TEXT) {
          return Thing.find({
              $NOR: [{
                'timeline.user.name': {
                  $regex: keywordObj.USER,
                  $options: 'i'
                }
              }, {
                'timeline.text': {
                  $regex: keywordObj.TEXT
                }
              }]
            }).sort({
              'timeline.created_at': -1
            }).exec()
            .then(handleEntityNotFound(res))
            .then(respondWithResult(res))
            .catch(handleError(res));
        }
      } else {
        // unwanted MODE TEXT
        // do the index() function
        return Thing.find().sort({
            'timeline.created_at': -1
          }).exec()
          .then(handleEntityNotFound(res))
          .then(respondWithResult(res))
          .catch(handleError(res));

      }
    } else {
      //keywordObj.MODE doesn't exist
      if (keywordObj.USER && !keywordObj.TEXT) {
        //with USER only without MODE
        // console.log(keywordObj.USER);
        return Thing.find({
            'timeline.user.name': {
              $regex: keywordObj.USER,
              $options: 'i'
            }
          }).sort({
            'timeline.created_at': 1
          }).exec()
          .then(handleEntityNotFound(res))
          .then(respondWithResult(res))
          .catch(handleError(res));
      }
      //with TEXT only without MODE
      if (!keywordObj.USER && keywordObj.TEXT) {
        return Thing.find({
            'timeline.text': {
              $regex: keywordObj.TEXT
            }
          }).sort({
            'timeline.created_at': -1
          }).exec()
          .then(handleEntityNotFound(res))
          .then(respondWithResult(res))
          .catch(handleError(res));
      }
      //with both USER and TEXT without MODE
      if (keywordObj.USER && keywordObj.TEXT) {
        return Thing.find({
            $or: [{
              'timeline.user.name': {
                $regex: keywordObj.USER,
                $options: 'i'
              }
            }, {
              'timeline.text': {
                $regex: keywordObj.TEXT
              }
            }]
          }).sort({
            'timeline.created_at': -1
          }).exec()
          .then(handleEntityNotFound(res))
          .then(respondWithResult(res))
          .catch(handleError(res));
      }
    }

  } else {
    //with no specific advanced searching keyword
    //system will do the simple search for either users or the timlines
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
        }, {
          'timeline.timelineType': {
            $regex: keyword,
            $options: 'i'
          }
        }]
      }).sort({
        'timeline.created_at': -1
      }).exec()
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
      .catch(handleError(res));


  }




}

// Gets a list of Things
export function index(req, res) {

  return Thing.find().sort({
      'timeline.created_at': -1
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
export function postTweet(req, res, next) {
  // console.log(req);
  //post tweet
  twitterClient.post('statuses/update', {
    status: req.body.name
  }, function (error, tweet, response) {
    if (error) {
      return handleError(res)(error).then(res.end());
    }
  });
  // return getTweet(req, res)
  next();

}

export function postWeibo(req, res, next) {

  var para = {
    "source": Weibo.appKey.appKey,
    "status": req.body.name
  };

  Weibo.Statuses.update(para, function (data) {
    var newWeibo = new Thing();
    newWeibo.timeline = data;
    //   newTweet.createdAt = tweet.created_at;
    newWeibo.timeline.timelineType = 'Sina Weibo';
    newWeibo.timeline.userAvatar = data.user.profile_image_url;
    newWeibo.save();
  });

  next();
}

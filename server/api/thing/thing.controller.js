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
// import User from '../user/user.model';
// import Twitter_Info from '../../auth/twitter/passport';


//require the package tiwtter
var twitter = require('twitter');


//set up the user's twitter token and token secret
// var twitterClient = new twitter({
//   consumer_key: 'YWhfVLPloADYwOMH0EebIJZW6',
//   consumer_secret: 'WLvtY4ijO224mjvCzZHqgZZfqvhvR1NhXQvTQ1cWPRIsRVLKFW',
//   access_token_key: '330958702-wnc1azXDPfkDJRsWWDGuovDQ7L6PZRpzNR3KqPsY',
//   access_token_secret: 'E88aQcJkPLtgpVFEFitOtGA37u5oMm5SgLD3lHM0qZfRo'
// });

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

//check if the user is authorized
function handleUnauthorized(req, res) {
  return function(entity) {
    if(!entity) {
      return null;
    }
    if(entity.user._id.toString() !== req.user._id.toString()) {
      res.send(403).end();
      return null;
    }
    return entity;
  }
}

// Gets a list of Things
export function index(req, res) {
  return Thing.find().sort({
      createdAt: -1
    }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Thing from the DB
export function show(req, res) {
  return Thing.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}



// Creates a new Thing in the DB
//
// Original Version
export function create(req, res) {
  req.body.user = req.user;
  // twitterClient.post('statuses/update', {
  //   status: req.body
  // }, function(error, tweet, response) {
  //   if(error) throw error;
  //   console.log(tweet); // Tweet body.
  //   console.log(response); // Raw response object.
  // });
  return Thing.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}
//
// get tweet Version
// export function create(req, res) {
//   req.body.user = req.user;
//   twitterClient.post('statuses/update', {
//     status: req.body
//   }, function(error, tweet, response) {
//     if(error) {
//       throw error;
//     }
//     console.log(tweet); // Tweet body.
//     console.log(response); // Raw response object.
//   });
// }

// Updates an existing Thing in the DB
export function update(req, res) {
  if(req.body._id) {
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
exports.star = function(req, res) {
  Thing.update({
    _id: req.params.id
  }, {
    $push: {
      stars: req.user._id
    }
  }, function(err, num) {
    if(err) {
      return handleError(res)(err);
    }
    if(num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
  });
};

//unstar thing
exports.unstar = function(req, res) {
  Thing.update({
    _id: req.params.id
  }, {
    $pull: {
      stars: req.user._id
    }
  }, function(err, num) {
    if(err) {
      return handleError(res)(err);
    }
    if(num === 0) {
      return res.send(404).end();
    }
    exports.show(req, res);
  });
};

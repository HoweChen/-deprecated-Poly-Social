'use strict';

var Twitter = require('twitter');

//set up the user's twitter token and token secret
var twitterClient = new Twitter({
  consumer_key: 'YWhfVLPloADYwOMH0EebIJZW6',
  consumer_secret: 'WLvtY4ijO224mjvCzZHqgZZfqvhvR1NhXQvTQ1cWPRIsRVLKFW',
  access_token_key: '330958702-wnc1azXDPfkDJRsWWDGuovDQ7L6PZRpzNR3KqPsY',
  access_token_secret: 'E88aQcJkPLtgpVFEFitOtGA37u5oMm5SgLD3lHM0qZfRo'
});





export function postTweet(req, res) {
  return twitterClient.post('statuses/update', {
    status: 'I Love Twitter and meanjs'
  }, function(error, tweet, response) {
    if(error) throw error;
    console.log(tweet); // Tweet body.
    console.log(response); // Raw response object.
  });
}

import passport from 'passport';
import {
  Strategy as TwitterStrategy
} from 'passport-twitter';

var consumerKey = 'YWhfVLPloADYwOMH0EebIJZW6';
var consumerSecret = "WLvtY4ijO224mjvCzZHqgZZfqvhvR1NhXQvTQ1cWPRIsRVLKFW";

export function setup(User, config) {
  passport.use(new TwitterStrategy({
      // consumerKey: config.twitter.clientID,
      // consumerSecret: config.twitter.clientSecret,
      consumerKey: 'YWhfVLPloADYwOMH0EebIJZW6',
      consumerSecret: 'WLvtY4ijO224mjvCzZHqgZZfqvhvR1NhXQvTQ1cWPRIsRVLKFW',
      callbackURL: config.twitter.callbackURL
    },
    function(token, tokenSecret, profile, done) {
      var providerData = profile._json;
      providerData.token = token;
      providerData.tokenSecret = tokenSecret;

      User.findOne({
          'twitter.id': profile.id
        }).exec()
        .then(user => {
          if(user) {
            return done(null, user);
          }

          user = new User({
            name: profile.displayName,
            username: profile.username,
            role: 'user',
            provider: 'twitter',
            twitter: providerData,
          });
          user.save()
            .then(user => done(null, user))
            .catch(err => done(err));
        })
        .catch(err => done(err));
    }));
}

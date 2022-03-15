const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');

passport.use(
    new LocalStrategy((username, password, cb) => {
        return User.findOne({ username })
            .then((user) => {
                if (!user) {
                    return cb(null, false, {
                        message: 'Incorrect username.',
                    });
                }

                bcrypt.compare(password, user.password, (err, res) => {
                    if (res) {
                        // Passwords match
                        return cb(null, user, {
                            message: 'Logged In Successfully',
                        });
                    } else {
                        // Passwords do not match
                        return cb(null, false, {
                            message: 'Incorrect password',
                        });
                    }
                });
            })
            .catch((err) => cb(err));
    })
);

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;

passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
        try {
            const user = await User.findById(jwtPayload.id);
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

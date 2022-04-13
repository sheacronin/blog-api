const User = require('../models/user');
const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');

exports.getAllUsers = (req, res, next) => {
    User.find()
        .sort([['username', 'descending']])
        .exec((err, users) => {
            if (err) return next(err);

            const usersWithoutPasswords = users.map((user) => {
                return {
                    username: user.username,
                    displayName: user.displayName,
                    id: user._id,
                };
            });

            res.json({ users: usersWithoutPasswords });
        });
};

exports.getUser = (req, res, next) => {
    const { userId } = req.params;

    User.findById(userId).exec((err, user) => {
        if (err) return next(err);

        res.json({
            user: {
                username: user.username,
                displayName: user.displayName,
                id: user._id,
            },
        });
    });
};

exports.getCurrentUser = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        res.json({
            user: {
                id: req.user._id,
                username: req.user.username,
                displayName: req.user.displayName,
            },
        });
    },
];

exports.createUser = [
    body('username', 'Username must be specified')
        .trim()
        .isLength({ min: 3, max: 20 }),
    body('displayName', 'Display name must be specified')
        .trim()
        .isLength({ min: 1, max: 30 }),
    body('password', 'You must have a password').trim().isLength({ min: 1 }),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error(
                    'Password confirmation does not match password'
                );
            }
            // Indicates success of this synchronous custom validator
            return true;
        }),

    (req, res, next) => {
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            const errors = validationResult(req);

            const user = new User({
                username: req.body.username,
                displayName: req.body.displayName,
                password: hashedPassword,
            });

            if (!errors.isEmpty()) {
                return res
                    .status(400)
                    .json({ message: 'Something is not right', errors });
            } else {
                User.findOne({ username: user.username }).exec(
                    (err, foundUser) => {
                        if (err) return next(err);

                        if (foundUser) {
                            return res.status(400).json({
                                message:
                                    'A user with this username already exists',
                            });
                        } else {
                            user.save((err) => {
                                if (err) return next(err);

                                res.json({
                                    user: {
                                        username: user.username,
                                        displayName: user.displayName,
                                        id: user._id,
                                    },
                                });
                            });
                        }
                    }
                );
            }
        });
    },
];

exports.loginUser = (req, res) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: 'Something is not right',
                user: user,
                info,
            });
        }

        req.login(user, { session: false }, (err) => {
            if (err) {
                res.send(err);
            }

            // generate a signed on web token with the contents
            // of user object and return it in the response

            const token = jwt.sign(user.toJSON(), process.env.SECRET_KEY, {
                expiresIn: '1h',
            });

            return res.json({
                user: {
                    username: user.username,
                    displayName: user.displayName,
                    id: user._id,
                },
                token,
            });
        });
    })(req, res);
};

exports.logoutUser = (req, res, next) => {
    // Remove the token cookie
    res.cookie('token', '', { httpOnly: true, maxAge: 1 });
    res.json({ message: 'Token cookie has been destroyed' });
};

exports.getPostsByUser = (req, res, next) => {
    Post.find({ author: req.params.userId })
        .sort([['timestamp', 'descending']])
        .populate('author', '-password')
        .populate({
            path: 'comments',
            populate: { path: 'author', select: '-password' },
            options: { sort: { timestamp: -1 } },
        })
        .exec((err, posts) => {
            if (err) return next(err);

            res.json(posts);
        });
};

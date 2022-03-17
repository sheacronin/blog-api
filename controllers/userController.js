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

            res.json(users);
        });
};

exports.getUser = (req, res, next) => {
    const { userId } = req.params;

    User.findById(userId).exec((err, user) => {
        if (err) return next(err);

        res.json(user);
    });
};

exports.createUser = [
    body('username', 'Username must be specified')
        .trim()
        .isLength({ min: 3, max: 20 })
        .escape(),
    body('displayName', 'Display name must be specified')
        .trim()
        .isLength({ min: 1, max: 30 })
        .escape(),
    body('password', 'You must have a password'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
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
                                    username: user.username,
                                    displayName: user.displayName,
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

            const token = jwt.sign(user.toJSON(), process.env.SECRET_KEY);
            return res.json({ user, token });
        });
    })(req, res);
};

exports.getPostsByUser = (req, res, next) => {
    Post.find({ author: req.params.userId })
        .populate('author')
        .populate('comments')
        .exec((err, posts) => {
            if (err) return next(err);

            res.json(posts);
        });
};

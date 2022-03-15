const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

exports.getAllPosts = (req, res) => {
    Post.find()
        .sort([['timestamp', 'descending']])
        .populate('author')
        .exec((err, posts) => {
            if (err) return next(err);

            res.json(posts);
        });
};

exports.getPost = (req, res) => {
    const { postId } = req.params;

    Post.findById(postId)
        .populate('author')
        .exec((err, post) => {
            if (err) return next(err);

            res.json(post);
        });
};

exports.createPost = [
    body('title', 'Title must be specified')
        .trim()
        .isLength({ min: 1, max: 40 })
        .escape(),
    body('content', 'Post must have content')
        .trim()
        .isLength({ min: 1 })
        .escape(),

    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        console.log('this runs');
        const errors = validationResult(req);

        const post = new Post({
            title: req.body.title,
            author: req.user.id,
            content: req.body.content,
            timestamp: new Date(),
            isPublished: req.body.isPublished === 'true' ? true : false,
        });

        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'There was an issue',
                errors: errors.array(),
            });
            return;
        } else {
            post.save((err) => {
                if (err) return next(err);

                res.json({ post });
            });
        }
    },
];

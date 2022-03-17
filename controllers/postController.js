const Post = require('../models/post');
const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

exports.getAllPosts = (req, res) => {
    Post.find()
        .sort([['timestamp', 'descending']])
        .populate('author')
        .populate('comments')
        .exec((err, posts) => {
            if (err) return next(err);

            res.json(posts);
        });
};

exports.getPost = (req, res) => {
    const { postId } = req.params;

    Post.findById(postId)
        .populate('author')
        .populate('comments')
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
        const errors = validationResult(req);

        const post = new Post({
            title: req.body.title,
            author: req.user.id,
            content: req.body.content,
            timestamp: new Date(),
            isPublished: req.body.isPublished === 'true' ? true : false,
            comments: [],
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

exports.editPost = [
    body('title', 'Title must be specified').trim().escape(),
    body('content', 'Post must have content').trim().escape(),

    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        const errors = validationResult(req);

        Post.findById(req.params.postId).then((originalPost) => {
            console.log(originalPost);
            const newPost = {
                title: req.body.title || originalPost.title,
                content: req.body.content || originalPost.content,
                isPublished: req.body.isPublished === 'true' ? true : false,
            };

            if (!errors.isEmpty()) {
                res.status(400).json({
                    message: 'There was an issue',
                    errors: errors.array(),
                });
                return;
            } else {
                Post.findByIdAndUpdate(
                    req.params.postId,
                    newPost,
                    { new: true },
                    (err, thePost) => {
                        if (err) return next(err);

                        res.json({ thePost });
                    }
                );
            }
        });
    },
];

exports.deletePost = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        Post.findByIdAndRemove(req.params.postId, (err, thePost) => {
            if (err) return next(err);

            console.log(thePost.comments);
            // Delete comments belonging to the post
            Comment.deleteMany({ _id: { $in: thePost.comments } });

            res.json({
                message: `Post ${req.params.postId} has been successfully deleted`,
            });
        });
    },
];

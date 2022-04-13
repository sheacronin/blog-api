const Post = require('../models/post');
const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

exports.getAllPosts = (req, res) => {
    Post.find({ isPublished: true })
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

exports.getPost = (req, res) => {
    const { postId } = req.params;

    Post.findById(postId)
        .populate('author', '-password')
        .populate({
            path: 'comments',
            populate: { path: 'author', select: '-password' },
            options: { sort: { timestamp: -1 } },
        })
        .exec((err, post) => {
            if (err) return next(err);

            res.json(post);
        });
};

exports.createPost = [
    body('title', 'Title must be specified')
        .trim()
        .isLength({ min: 1, max: 40 }),
    body('content', 'Post must have content').trim().isLength({ min: 1 }),
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        const errors = validationResult(req);

        const post = new Post({
            title: req.body.title,
            author: req.user.id,
            content: req.body.content,
            timestamp: new Date(),
            isPublished: req.body.isPublished,
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
    body('title', 'Title must be specified').trim(),
    body('content', 'Post must have content').trim(),

    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        const errors = validationResult(req);

        Post.findById(req.params.postId).then((originalPost) => {
            const newPost = {
                title: req.body.title || originalPost.title,
                content: req.body.content || originalPost.content,
                isPublished: req.body.isPublished,
            };

            if (
                req.user._id.toString() !== originalPost.author._id.toString()
            ) {
                return res.sendStatus(403);
            }

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

                        res.json({ post: thePost });
                    }
                );
            }
        });
    },
];

exports.deletePost = [
    passport.authenticate('jwt', { session: false }),

    async (req, res, next) => {
        const post = await Post.findById(req.params.postId);
        if (req.user._id.toString() !== post.author.toString()) {
            return res.sendStatus(403);
        }

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

exports.togglePostPublished = [
    passport.authenticate('jwt', { session: false }),

    async (req, res, next) => {
        const post = await Post.findById(req.params.postId);
        if (req.user._id.toString() !== post.author.toString()) {
            return res.sendStatus(403);
        }

        Post.findByIdAndUpdate(
            req.params.postId,
            [{ $set: { isPublished: { $eq: ['$isPublished', false] } } }],
            { new: true },
            (err, thePost) => {
                if (err) return next(err);

                res.json({ post: thePost });
            }
        );
    },
];

const Comment = require('../models/comment');
const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

exports.createComment = [
    body('content', 'Comment must have content').trim().isLength({ min: 1 }),

    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        const errors = validationResult(req);

        const comment = new Comment({
            content: req.body.content,
            author: req.user.id,
            timestamp: new Date(),
        });

        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'There was an issue',
                errors: errors.array(),
            });
            return;
        } else {
            comment.save((err) => {
                if (err) return next(err);

                // Add comment to post
                Post.findByIdAndUpdate(
                    req.params.postId,
                    {
                        $push: { comments: comment._id },
                    },
                    { new: true },
                    (thePost) => console.log(thePost)
                );

                Comment.populate(
                    comment,
                    { path: 'author', select: '-password' },
                    (err, theComment) => {
                        if (err) return next(err);
                        res.json({ comment: theComment });
                    }
                );
            });
        }
    },
];

exports.editComment = [
    body('content', 'Comment must have content').trim().isLength({ min: 1 }),

    passport.authenticate('jwt', { session: false }),

    async (req, res, next) => {
        const errors = validationResult(req);

        const newComment = {
            content: req.body.content,
        };

        if (!errors.isEmpty()) {
            res.status(400).json({
                message: 'There was an issue',
                errors: errors.array(),
            });
            return;
        } else {
            const comment = await Comment.findById(req.params.commentId);
            if (req.user._id.toString() !== comment.author.toString()) {
                return res.sendStatus(403);
            }

            Comment.findByIdAndUpdate(
                req.params.commentId,
                newComment,
                { new: true },
                (err, theComment) => {
                    if (err) return next(err);

                    res.json({ comment: theComment });
                }
            );
        }
    },
];

exports.deleteComment = [
    passport.authenticate('jwt', { session: false }),

    async (req, res, next) => {
        const comment = await Comment.findById(req.params.commentId);
        if (req.user._id.toString() !== comment.author.toString()) {
            return res.sendStatus(403);
        }

        // Remove comment id from post
        Post.findByIdAndUpdate(
            req.params.postId,
            {
                $pull: { comments: req.params.commentId },
            },
            { new: true },
            (err, thePost) => {
                if (err) return next(err);
                console.log(thePost);
            }
        );

        Comment.findByIdAndRemove(req.params.commentId, (err) => {
            if (err) return next(err);

            res.json({
                message: `Comment ${req.params.commentId} has been successfully deleted`,
            });
        });
    },
];

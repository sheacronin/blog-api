const Comment = require('../models/comment');
const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

exports.createComment = [
    body('content', 'Comment must have content')
        .trim()
        .isLength({ min: 1 })
        .escape(),

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

                res.json({ comment });
            });
        }
    },
];

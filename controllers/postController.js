const Post = require('../models/post');

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

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

/* GET posts listing. */
router.get('/', postController.getAllPosts);
router.post('/', postController.createPost);

router.get('/:postId', postController.getPost);
router.put('/:postId', postController.editPost);
router.delete('/:postId', postController.deletePost);

router.post('/:postId/comments', commentController.createComment);
router.put('/:postId/comments/:commentId', commentController.editComment);
router.delete('/:postId/comments/:commentId', commentController.deleteComment);

module.exports = router;

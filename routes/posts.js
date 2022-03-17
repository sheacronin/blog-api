const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

/* GET posts listing. */
router.get('/', postController.getAllPosts);
router.post('/', postController.createPost);

router.get('/:postId', postController.getPost);
router.put('/:postId', postController.editPost);
router.delete('/:postId', postController.deletePost);

module.exports = router;

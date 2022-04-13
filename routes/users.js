const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/* GET users listing. */
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/current-user', userController.getCurrentUser);

router.post('/login', userController.loginUser);

router.get('/:userId', userController.getUser);
router.get('/:userId/posts', userController.getPostsByUser);

module.exports = router;

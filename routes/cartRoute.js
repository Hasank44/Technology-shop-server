import express from 'express';
import {
    getCartController, addToCartController, updateCartController, removeCartController
} from '../controllers/cartController.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
const router = express.Router();

router.get('/', isAuthenticated, getCartController);
router.post('/add', isAuthenticated, addToCartController);
router.put('/update', isAuthenticated, updateCartController);
router.delete('/delete/:productId', isAuthenticated, removeCartController);


export default router;
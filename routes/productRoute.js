import express from 'express';
import {
    getProductsController, getProductByIdController, createProductController, updateProductController, deleteProductController
} from '../controllers/productController.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { multiFilesUpload } from '../middlewares/uploadCloudinary.js';


const router = express.Router();
router.get('/', getProductsController);
router.get('/product/:id', getProductByIdController);
router.post('/add/product', isAuthenticated, multiFilesUpload('files', 5, 'products'), createProductController);
router.put('/product/:id', isAuthenticated, multiFilesUpload('files', 5, 'products'), updateProductController);
router.delete('/product/:id', isAuthenticated, deleteProductController);

export default router;
import express from 'express';
import {
    userGetAllByAdminController, userGetOneByAdminController, userPasswordChangeByAdminController,
    userUpdateByAdminController, getMeByAdminController, allAdminsGetByAdminController,
    
} from '../controllers/adminController.js';

import isAuthenticated from '../middlewares/isAuthenticated.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import { singleUpload } from '../middlewares/multerUploadToCloud.js';

const router = express.Router();

router.get('/', isAuthenticated, roleMiddleware('admin'), allAdminsGetByAdminController)
router.get('/users', isAuthenticated, roleMiddleware('admin'), userGetAllByAdminController);
router.get('/user/:id', isAuthenticated, roleMiddleware('admin'), userGetOneByAdminController);
router.get('/admin/me', isAuthenticated, roleMiddleware('admin'), getMeByAdminController);
router.post('/change/user-password/:id', isAuthenticated, roleMiddleware('admin'), userPasswordChangeByAdminController);
router.put('/user/update/:id', isAuthenticated, roleMiddleware('admin'), singleUpload, userUpdateByAdminController);

export default router;

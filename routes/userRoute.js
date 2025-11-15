import express from 'express';
import {
    userRegisterController, userEmailVerifyController, userEmailReVerifyController, userLoginController,
    userLogoutController, userPasswordForgetController, userOtpVerifyController, userNewPasswordController,
    userPasswordChangeController, userGetMeController, userUpdateController,
    userReSendOtp,
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { singleUpload } from '../middlewares/multerUploadToCloud.js';
const router = express.Router();

router.get('/user/me', isAuthenticated, userGetMeController);
router.post('/register', userRegisterController);
router.post('/verify', authMiddleware , userEmailVerifyController);
router.post('/reverify', userEmailReVerifyController);
router.post('/login', userLoginController);
router.post('/logout', isAuthenticated, userLogoutController);
router.post('/forget-password', userPasswordForgetController);
router.post('/re-send/otp/:email', userReSendOtp);
router.post('/verify/otp/:email', userOtpVerifyController);
router.post('/new-password/:email', userNewPasswordController);
router.post('/user/password/change', isAuthenticated, userPasswordChangeController);
router.put('/user/update/me', isAuthenticated, singleUpload, userUpdateController);

export default router;
const validate = (user) => {
    const error = {};

    // newPassword
    if (!user.newPassword) {
        error.message = 'Please Provide Your New Password';
    } else if (user.newPassword.length < 8) {
        error.message = 'Password Must At Latest 8 Characters';
    };

    // confirmPassword
    if (!user.confirmPassword) {
        error.message = 'Please Provide Your Confirm Password';
    } else if (user.newPassword !== user.confirmPassword) {
        error.message = 'Password do not Match';
    };

    return {
        error,
        isValid: Object.keys(error).length === 0
    };
};

export default validate;
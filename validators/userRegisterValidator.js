import validator from 'validator';

const validate = (user) => {
    const error = {};

    // first name
    if (!user.firstName) {
        error.message = 'Please Provide Your First Name';
    };

    //last name
    if (!user.firstName) {
        error.message = 'Please Provide Your Last Name';
    };

    //email
    if (!user.email) {
        error.message = 'Please Provide Your Email';
    } else if (!user.email === validator.isEmail(user.email)) {
        error.message = 'Please Provide A valid Email';
    };

    // password
    if (!user.password) {
        error.message = 'Please Provide Your Password';
    } else if (user.password.length < 8) {
        error.message = 'Password Must At Latest 8 Characters';
    };

    return {
        error,
        isValid: Object.keys(error).length === 0
    };
};

export default validate;
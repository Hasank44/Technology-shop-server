import validator from 'validator';

const validate = user => {
    
    const errors = {};

    // Validate name
    if (!user.name || validator.isEmpty(user.name.trim())) {
        errors.message = "Name is required";
    };

    // Validate price
    if (!user.price || validator.isEmpty(user.price.toString().trim())) {
        errors.message = "Price is required";
    } else if (!validator.isNumeric(user.price.toString())) {
        errors.message = "Price must be a number";
    };

    // Validate description
    if (!user.description || validator.isEmpty(user.description.trim())) {
        errors.message = "Description is required";
    };

    // Validate brand
    if (!user.brand || validator.isEmpty(user.brand.trim())) {
        errors.message = "Brand is required";
    };

    // Validate category
    if (!user.category || validator.isEmpty(user.category.trim())) {
        errors.message = "Category is required";
    };

    // Validate countInStock
    if (!user.countInStock || validator.isEmpty(user.countInStock.toString().trim())) {
        errors.message = "Count in stock is required";
    } else if (!validator.isInt(user.countInStock.toString())) {
        errors.message = "Count in stock must be an integer";
    };

    // Validate discount
    if (!user.discount || validator.isEmpty(user.discount.toString().trim())) {
        errors.message = "Discount is required";
    } else if (!validator.isInt(user.discount.toString())) {
        errors.message = "Discount must be an integer";
    };

    // netPrice
    if (!user.netPrice || validator.isEmpty(user.netPrice.toString().trim())) {
        errors.message = "Net price is required";
    } else if (!validator.isNumeric(user.netPrice.toString())) {
        errors.message = "Net price must be a number";
    };

    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

export default validate;
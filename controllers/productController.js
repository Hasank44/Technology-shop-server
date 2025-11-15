import mongoose from "mongoose";
import Product from "../models/Product.js";
import User from "../models/User.js";
import productValidator from "../validators/productValidator.js";

export const getProductsController = async (req, res) => {
    try {
        const products = await Product.find({ countInStock: { $gt: 0 } });
        if (products.length === 0) {
            return res.status(404).json({
                message: "No products found"
            });
        };
        return res.status(200).json({
            message: "Products retrieved successfully",
            result: products
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred",
        });
    };
};

export const createProductController = async (req, res) => {
    try {
        const { name, price, description, brand, category, discount, netPrice, countInStock } = req.body;
        const userId = req.user._id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid Credentials"
            });
        };
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        };
        const { errors, isValid } = productValidator({
            name,
            price,
            description,
            brand,
            category,
            discount,
            netPrice,
            countInStock
        });
        if (!isValid) {
            return res.status(400).json(errors.message);
        };
        const uploadedFiles = req.files || [];
        const imageUrl = uploadedFiles.map(file => ({
            url: file.cloudinary.secure_url,
            public_id: file.cloudinary.public_id
        }));
        const newProduct = new Product({
            userId,
            name,
            price,
            description,
            brand,
            category,
            discount,
            netPrice,
            countInStock,
            imageUrl: imageUrl
        });
        await newProduct.save();
        return res.status(201).json({
            message: "Product created success",
            result: newProduct
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred",
        });
    };
};

export const getProductByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Product ID"
            });
        };
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        };
        return res.status(200).json({
            result: product
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred",
        });
    };
};

export const updateProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, brand, category, discount, netPrice, countInStock } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Product ID"
            });
        };
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        };
        const { errors, isValid } = productValidator({
            name,
            price,
            description,
            brand,
            category,
            discount,
            netPrice,
            countInStock
        });
        if (!isValid) {
            return res.status(400).json(errors.message);
        };
        const uploadedFiles = req.files || [];
        const imageUrl = uploadedFiles.map(file => ({
            url: file.cloudinary.secure_url,
            public_id: file.cloudinary.public_id
        }));
        product.name = name;
        product.price = price;
        product.description = description;
        product.brand = brand;
        product.category = category;
        product.discount = discount;
        product.netPrice = netPrice;
        product.countInStock = countInStock;
        if (imageUrl.length > 0) {
            product.imageUrl = imageUrl;
        };
        await product.save();
        return res.status(200).json({
            message: "updated success",
            result: product
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred",
        });
    };
};

export const deleteProductController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Product ID"
            });
        };
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        };
        await Product.findByIdAndDelete(id);
        return res.status(200).json({
            message: "delete success"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred",
        });
    };
    
};
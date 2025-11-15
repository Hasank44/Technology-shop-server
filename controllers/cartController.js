import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// get cart for a user
export const getCartController = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'invalid credentials'
            });
        };
        let cart = await Cart.findOne({ userId: _id }).populate('items.productId');
        if (!cart) {
            return res.status(200).json({
                success: true,
                result: [],
                message: 'Cart is empty',
                totalItems: 0,
                totalPrice: 0
            });
        };
        return res.status(200).json({
            success: true,
            result: cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error Occurred',
        });
    };
};

// add to cart
export const addToCartController = async (req, res) => {
    try {
        const { _id } = req.user;
        const { productId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(_id) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: 'invalid credentials'
            });
        };
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        };
        const image = product?.imageUrl[0]?.url;
        const title = product?.name;
        let cart = await Cart.findOne({ userId: _id });
        if (!cart) {
            cart = new Cart({
                userId: _id,
                items: [{ productId, quantity: 1, price: product?.price, image, title }],
                totalPrice: product?.price
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => item.productId.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += 1;
            } else {
                cart.items.unshift({
                    productId,
                    quantity: 1,
                    price: product.price,
                    image,
                    title
                });
            };
            cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
        }
        await cart.save();
        const populatedCart = await cart.populate('items.productId');
        return res.status(200).json({
            success: true,
            result: populatedCart,
            message: 'Product added to cart successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error Occurred',
        });
    };
};

export const updateCartController = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { productId, type } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user or product ID"
            });
        };
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart is empty"
            });
        };
        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        };
        const product = await Product.findById(productId).select("countInStock");
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product does not exist"
            });
        };

        const currentQty = cart.items[itemIndex].quantity;
        if (type === "increment") {
            if (currentQty >= product.countInStock) {
                return res.status(400).json({
                    success: false,
                    message: "Stock limit reached"
                });
            };
            cart.items[itemIndex].quantity += 1;
        } else if (type === "decrement") {
            if (currentQty <= 1) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity -= 1;
            };
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid update type"
            });
        };
        cart.totalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
        await cart.save();
        const populatedCart = await Cart.findOne({ userId }).populate({
            path: "items.productId",
            select: "name price image countInStock"
        });
        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            result: populatedCart,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    };
};

export const removeCartController = async (req, res) => {
   try {
        const userId = req.user?._id;
        const { productId } = req.params;
        if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user or product ID"
            });
       };
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
               success: false,
               message: "Cart is empty"
            });
       };
        const exists = cart.items.some(item => item.productId.toString() === productId);
        if (!exists) {
            return res.status(400).json({
                success: false,
                message: "This product is not in your cart"
            });
       };
        cart.items = cart.items.filter(i => i.productId.toString() !== productId);
        cart.totalPrice = cart.items.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);
        await cart.save();

        const populatedCart = await cart.populate("items.productId");
        return res.status(200).json({
            success: true,
            message: "Product removed successfully",
            result: populatedCart
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    };
};


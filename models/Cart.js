import { Schema, model } from 'mongoose';

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: true
    },
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1 
                },
                price: {
                    type: Number,
                    required: true,
                },
                title: {
                    type: String,
                    required: true
                },
                image: {
                    type: String,
                    required: true
                }
            }
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

const Cart = model('Cart', cartSchema);
export default Cart;
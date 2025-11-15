import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
    },
    price: {
        type: Number,
    },
    description: {
        type: String,
    },
    brand: {
        type: String,
    },
    category: {
        type: String,
        lowercase: true,
    },
    discount: {
        type: Number,
        default: 0
    },
    netPrice: {
        type: Number,
    },
    countInStock: {
        type: Number,
        default: 0
    },
    imageUrl: [
        {
            url: { type: String },
            public_id: { type: String }
        }
    ]
}, {
    timestamps: true,
});

const Product = model('Product', productSchema);
export default Product;
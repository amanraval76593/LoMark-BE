import mongoose, { Schema } from "mongoose";
import { IProduct } from "./product.interface";

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        enum: ["kg", "piece", "litre", "pack"],
        required: true
    },
    sellerId: {
        type: String,
        required: true,
        index: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },

},
    {
        timestamps: true,
    }
);
export const ProductModel = mongoose.model<IProduct>(
    "Product",
    productSchema
);
import mongoose, { Schema } from "mongoose";
import { IProduct } from "./product.interface";
import { ProductCategory } from "./product.type";

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ProductCategory,
        required: true,
        index: true
    },
    description:{
        type:String,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    seller_id: {
        type: String,
        required: true,
        index: true
    },
    is_available: {
        type: Boolean,
        default: true,
        index: true
    },
    seller: {
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
                required: true
            },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: (coordinates: number[]) => coordinates.length === 2,
                    message: "Coordinates must contain longitude and latitude",
                }
            }
        },
        delivery_radius_km: {
            type: Number,
            required: true,
            min: 0
        }
    },
    rating: {
        avg: {
            type: Number,
            default: 0,
            min: 0
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
},
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

productSchema.index({ "seller.location": "2dsphere" });

export const ProductModel = mongoose.model<IProduct>(
    "Product",
    productSchema
);

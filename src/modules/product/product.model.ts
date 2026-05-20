import mongoose, { Schema } from 'mongoose';
import type { IProduct } from './product.interface';
import { ProductCategory, QuantityType } from './product.type';

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: Object.values(ProductCategory),
    required: true,
    index: true,
  },
  description:{
    type:String,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total_quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  reserved_quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  sold_quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  quantity_unit:{
    type:String,
    enum:Object.values(QuantityType),
    required:true,
  },
  seller_id: {
    type: String,
    required: true,
    index: true,
  },
  is_available: {
    type: Boolean,
    default: true,
    index: true,
  },
  seller: {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coordinates: number[]) => coordinates.length === 2,
          message: 'Coordinates must contain longitude and latitude',
        },
      },
    },
    delivery_radius_km: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  rating: {
    avg: {
      type: Number,
      default: 0,
      min: 0,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
},
);

productSchema.index({ 'seller.location': '2dsphere' });

productSchema.virtual('available_quantity').get(function () {
  return this.total_quantity - this.reserved_quantity - this.sold_quantity;
});

export const ProductModel = mongoose.model<IProduct>(
  'Product',
  productSchema,
);

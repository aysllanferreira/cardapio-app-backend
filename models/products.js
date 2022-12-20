import mongoose from 'mongoose';
import mongooseBeautifyUnique from 'mongoose-beautiful-unique-validation';
import Joi from 'joi';

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    unique: 'Product name already exists',
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

productSchema.plugin(mongooseBeautifyUnique);

// Validate Schema with Joi
export const validateProduct = (product) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    category: Joi.string().min(3).max(30).required(),
    description: Joi.string().min(3).max(30).required(),
    price: Joi.number().required(),
    image: Joi.string().required(),
  });

  return schema.validate(product);
};

export default mongoose.model('Product', productSchema);

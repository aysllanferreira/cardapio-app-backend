import mongoose from 'mongoose';
import Joi from 'joi';

const userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  confirmPassword: String,
  active: Boolean,
});

// Validate Schema with Joi
export const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().min(3).max(30).required()
      .email(),
    password: Joi.string().min(3).max(30).required(),
    confirmPassword: Joi.ref('password'),
  });

  return schema.validate(user);
};

export default mongoose.model('User', userSchema);

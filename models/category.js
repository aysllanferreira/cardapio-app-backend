import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: 'Category name already exists',
  },
});

export default mongoose.model('Category', categorySchema);

/* eslint-disable import/extensions */
import express from 'express';
import {
  addProduct, getProducts, uploadImage, deleteProduct, updateProduct, getProductById,
} from '../controllers/products.js';

const router = express.Router();

router.post('/', addProduct);
router.get('/', getProducts);
router.post('/upload', uploadImage);
router.delete('/delete', deleteProduct);
router.put('/update', updateProduct);
router.get('/getId', getProductById);

export default router;
/* eslint-disable import/extensions */
import express from 'express';
import {
  addProduct, getProducts, uploadImage, deleteProduct, updateProduct,
  getProductById, addNewCategory, getCategories, deleteCategory,
} from '../controllers/products.js';

const router = express.Router();

router.post('/', addProduct);
router.get('/', getProducts);
router.post('/upload', uploadImage);
router.delete('/delete', deleteProduct);
router.put('/update', updateProduct);
router.get('/getId', getProductById);
router.post('/addCategory', addNewCategory);
router.get('/getCategories', getCategories);
router.delete('/deleteCategory', deleteCategory);

export default router;

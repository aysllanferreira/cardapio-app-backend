/* eslint-disable import/extensions */
/* eslint-disable consistent-return */
import Multer from 'multer';
import fs from 'fs';
import Product, { validateProduct } from '../models/products.js';
import Category from '../models/category.js';

const storage = Multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'images');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${file.originalname}`);
  },
});

const parser = Multer({ storage });

export const uploadImage = async (req, res) => {
  parser.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const image = {};
    image.id = req.file.filename;
    image.url = `/${image.id}`;
    res.status(200).json(image);
  });
};

export const addProduct = async (req, res) => {
  const {
    name, category, description, price, image,
  } = req.body;

  const { error } = validateProduct(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const newProduct = new Product({
      productName: name,
      category,
      description,
      price,
      image,
      active: true,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { _id } = req.body;
  const getId = _id.id;
  if (!getId) return res.status(400).json({ message: 'No product id provided' });

  // Delete image from /images folder
  const product = await Product.findById(getId);

  const imageName = product.image.split('/')[4];
  const imagePath = `images/${imageName}`;

  fs.unlink(imagePath, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
  });

  try {
    await Product.findByIdAndDelete(getId);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  const {
    name, category, description, price, id,
  } = req.body;

  const { image } = req.body;
  const imgSliced = image.split('/').slice(3, 5).join('/');

  const getOldImage = await Product.findById(id);
  const oldImage = getOldImage.image.split('/')[4];

  // Delete old image from /images folder
  const imagePath = `images/${oldImage}`;
  if (imgSliced === imagePath) {
    // do nothing
  } else {
    fs.unlink(
      imagePath,
      (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
      },
    );
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, {
      productName: name,
      category,
      description,
      price,
      image,
    }, { new: true });

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getProductById = async (req, res) => {
  // get id from data sent from client
  const { id } = req.headers;
  if (!id) return res.status(400).json({ message: req.headers.id });

  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const addNewCategory = async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ message: 'No category provided' });

  try {
    const newCategory = new Category({ category });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

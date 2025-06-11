import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get expiring products
router.get('/expiring', auth, async (req, res) => {
  try {
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

    const expiringProducts = await Product.find({
      expirationDate: {
        $exists: true,
        $ne: null,
        $lte: tenDaysFromNow,
        $gte: new Date()
      },
      notificationSent: false
    }).sort({ expirationDate: 1 });

    res.json(expiringProducts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Mark notification as sent
router.put('/notification/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { notificationSent: true },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Reset notification status for a product
router.put('/reset-notification/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { notificationSent: false },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(500).send('Server error');
  }
});

router.post('/', auth, async (req, res) => {
  const { name, productNumber, category, stock, price, description, imageUrl, expirationDate } = req.body;
  
  try {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    const existingProduct = await Product.findOne({ productNumber });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product number already exists' });
    }
    
    const newProduct = new Product({
      name,
      productNumber,
      category,
      stock,
      price,
      description,
      imageUrl,
      expirationDate,
      notificationSent: false
    });
    
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, productNumber, category, stock, price, description, imageUrl, expirationDate } = req.body;
  
  try {
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }
    
    if (productNumber) {
      const existingProduct = await Product.findOne({ 
        productNumber, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingProduct) {
        return res.status(400).json({ message: 'Product number already exists' });
      }
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (name) product.name = name;
    if (productNumber) product.productNumber = productNumber;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (price !== undefined) product.price = price;
    if (description) product.description = description;
    if (imageUrl) product.imageUrl = imageUrl;
    if (expirationDate) {
      product.expirationDate = expirationDate;
      product.notificationSent = false; // Reset notification when date changes
    }
    
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(500).send('Server error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(500).send('Server error');
  }
});

export default router;
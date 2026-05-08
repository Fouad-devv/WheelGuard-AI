import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Product from './models/Product.js';  // Schema
import {products} from './data/Products.js'; // data


const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);

    // insert products
    await Product.insertMany(products);

    console.log('Products inserted successfully');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DeliveryOption from './models/DeliveryOption.js'; // adjust path if needed

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);

    // Optional: remove old options
    await DeliveryOption.deleteMany();

    const options = await DeliveryOption.insertMany([
      {
        name: 'Standard Delivery',
        priceCents: 500,
        estimatedDays: 5,
        description: 'Delivered within 5 business days'
      },
      {
        name: 'Express Delivery',
        priceCents: 1500,
        estimatedDays: 2,
        description: 'Delivered within 2 business days'
      },
      {
        name: 'Next Day Delivery',
        priceCents: 2500,
        estimatedDays: 1,
        description: 'Delivered tomorrow'
      }
    ]);

    console.log('Delivery options inserted ');
    console.log(options);

    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();

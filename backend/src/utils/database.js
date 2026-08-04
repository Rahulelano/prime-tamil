const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Use global variable to prevent multiple instances in development
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ MongoDB Database connected successfully');
  } catch (error) {
    console.error('❌ MongoDB Database connection failed:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ MongoDB Database disconnected successfully');
  } catch (error) {
    console.error('❌ MongoDB Database disconnection failed:', error.message);
  }
};

// MongoDB specific utility functions
const getDb = () => {
  return prisma.$runCommandRaw('db');
};

const checkConnection = async () => {
  try {
    const result = await prisma.$runCommandRaw({ ping: 1 });
    return result.ok === 1;
  } catch (error) {
    console.error('❌ MongoDB connection check failed:', error.message);
    return false;
  }
};

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
  getDb,
  checkConnection
};
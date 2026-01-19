export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  rateLimit: {
    login: parseInt(process.env.RATE_LIMIT_LOGIN || '5', 10),
    register: parseInt(process.env.RATE_LIMIT_REGISTER || '3', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  },

  business: {
    cartExpiryHours: parseInt(process.env.CART_EXPIRY_HOURS || '24', 10),
    taxRate: parseFloat(process.env.TAX_RATE || '0.08'),
    lowStockThreshold: parseInt(process.env.LOW_STOCK_THRESHOLD || '10', 10),
  },
} as const;

// Validate critical config in production
if (config.nodeEnv === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

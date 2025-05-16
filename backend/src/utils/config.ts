import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export function loadEnvConfig() {
  // Try to find the .env file
  const envPath = path.resolve(process.cwd(), '.env');
  
  // Check if .env file exists
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from ${envPath}`);
    dotenv.config({ path: envPath });
  } else {
    console.warn('No .env file found. Using environment variables or defaults.');
    dotenv.config();
  }
  
  // Create and return config object
  const config = {
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_for_development_only',
    COOKIE_NAME: 'blogcraft_auth',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
  
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET not set in environment variables. Using fallback secret. This is not secure for production!');
  }
  
  return config;
}

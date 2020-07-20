export const path = require('path');

export const JWT_KEY = 'secret';
export const SALT_ROUNDS = 10;

export const APP_BASE = path.resolve(__dirname, '..', '..');
export const APP_LOGS = path.resolve(APP_BASE, 'logs');
export const APP_UPLOADS = path.resolve(APP_BASE, 'uploads');

export const APP_PORT = process.env.PORT || 8000;
export const APP_HOST = 'localhost';
export const APP_URL = `http://${APP_HOST}:${APP_PORT}`;
export const APP_UPLOADS_URL = `${APP_URL}/uploads/`;
export const APP_ASSETS_URL = `${APP_URL}/assets/`;

export const KURENTO_URL =
  process.env.KURENTO_URL || 'ws://139.59.20.209:8888/kurento';

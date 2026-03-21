import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3009,
  dataServiceUrl: process.env.DATA_SERVICE_URL || 'http://localhost:4005',
  internalSecret: process.env.INTERNAL_SECRET,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5179',
};

interface UserPayload {
  id: string;
  email: string;
}

interface AppConfig {
  JWT_SECRET: string;
  COOKIE_NAME: string;
  FRONTEND_URL: string;
  PORT: string | number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
  
  var appConfig: AppConfig;
}

export {};
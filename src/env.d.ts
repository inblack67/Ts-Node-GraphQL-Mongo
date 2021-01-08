declare namespace NodeJS {
  export interface ProcessEnv {
    POSTGRES_USERNAME: string;
    POSTGRES_PASSWORD: string;
    SESSION_SECRET: string;
    MONGO_URI: string;
    NODE_ENV: string;
  }
}

declare namespace NodeJS {
  export interface ProcessEnv {
    SESSION_SECRET: string;
    MONGO_URI: string;
    NODE_ENV: string;
  }
}

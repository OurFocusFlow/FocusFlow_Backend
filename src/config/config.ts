    import { config } from "dotenv";
    import { resolve } from "node:path";

    if (process.env.NODE_ENV === "production") {
    config();
    } else {
    config({
        path: resolve("./.env.development"),
    });
    }

    export const PORT = process.env.PORT;
    export const port = Number(process.env.PORT) || 7000;

    export const DB_URI = process.env.DB_URI as string;
    export const REDIS_URI = process.env.REDIS_URI as string;

    export const USER_ACCESS_TOKEN_SECRET_KEY =
    process.env.USER_ACCESS_TOKEN_SECRET_KEY as string;

    export const USER_REFRESH_ACCESS_TOKEN_SECRET_KEY =
    process.env.USER_REFRESH_ACCESS_TOKEN_SECRET_KEY as string;

    export const SYSTEM_ACCESS_TOKEN_SECRET_KEY =
    process.env.SYSTEM_ACCESS_TOKEN_SECRET_KEY as string;

    export const SYSTEM_REFRESH_ACCESS_TOKEN_SECRET_KEY =
    process.env.SYSTEM_REFRESH_ACCESS_TOKEN_SECRET_KEY as string;

    export const EMAIL_App_PASSWORD =
    process.env.EMAIL_App_PASSWORD as string;

    export const EMAIL_APP = process.env.EMAIL_APP as string;

    export const CLIENT_ID = process.env.CLIENT_ID as string;
    
    export const ORIGINS = process.env.ORIGINS?.split(",") || [];

    export const SALT_ROUND = Number(process.env.SALT_ROUND) || 10;

    export const IV_LENGTH = Number(process.env.IV_LENGTH) || 16;

    export const ENC_SECRET_KEY = Buffer.from(
    process.env.ENC_SECRET_KEY as string
    );

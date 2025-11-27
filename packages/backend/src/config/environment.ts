import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Custom Bons API Configuration
    bonsApi: {
        baseUrl: process.env.BONS_API_BASE_URL || 'https://go.trybons.ai',
        apiKey: process.env.BONS_API_KEY || '',
        models: {
            claudeSonnet: 'anthropic/claude-sonnet-4.5',
            gptCodex: 'openai/gpt-5.1-codex-max',
            claudeOpus: 'anthropic/claude-opus-4.5'
        }
    },

    database: {
        url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/aidevplatform'
    },

    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-here',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
};

export default config;

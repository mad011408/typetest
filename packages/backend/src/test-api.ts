import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const BONS_API_BASE_URL = process.env.BONS_API_BASE_URL || 'https://go.trybons.ai';
const BONS_API_KEY = process.env.BONS_API_KEY;

console.log('Testing Bons API Connection...');
console.log('URL:', BONS_API_BASE_URL);
console.log('Key present:', !!BONS_API_KEY);

async function testChatCompletion() {
    try {
        console.log('\nSending test request...');
        const response = await axios.post(
            `${BONS_API_BASE_URL}/v1/chat/completions`,
            {
                model: 'anthropic/claude-sonnet-4.5',
                messages: [
                    { role: 'user', content: 'Hello, are you working?' }
                ],
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${BONS_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('\nSuccess! Response:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error('\nError:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testChatCompletion();

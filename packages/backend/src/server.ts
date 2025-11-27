import App from './app';

const appInstance = new App();

// For Vercel Serverless
export default appInstance.app;

// For Local Development
if (process.env.NODE_ENV !== 'production') {
    appInstance.listen();
}

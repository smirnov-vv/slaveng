import fs from 'fs';
import path from 'path';
import '../server/lib/db.js';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import pug from 'pug';
import userRoutes from '../server/routes/users.js';
import offlineRoute from '../server/routes/offline.js';
import dotenv from 'dotenv';
import fastifyFormbody from '@fastify/formbody';

dotenv.config();

// HTTPS options
const httpsOptions = {
  key: fs.readFileSync(path.join(process.cwd(), 'sslcert', 'privkey.pem')),
  cert: fs.readFileSync(path.join(process.cwd(), 'sslcert', 'fullchain.pem')),
};

// Initialize Fastify with HTTPS
const app = fastify({
  logger: true,
  http2: true,
  https: httpsOptions,
});

// Register the Fastify body parser (built-in for application/x-www-form-urlencoded)
app.register(fastifyFormbody);

// Register plugins
app.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public'),
  // prefix: '/public/',
});

app.register(fastifyView, {
  engine: { pug },
  root: path.join(process.cwd(), 'server', 'views'),
});

app.register(userRoutes, { prefix: '/api' });
app.register(offlineRoute, { prefix: '/api' });

// Custom error handler
app.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    // Handle validation errors
    return reply.status(400).view('index.pug', {
      statusCode: 400,
      message: error.message.split('/')[1],
      tryAgain: 'Try again',
      details: error,
    });
  }

  // Handle other errors
  reply.status(500).view('index.pug', {
    statusCode: 500,
    message: 'Internal Server Error',
    details: error.message,
  });
});

// Example route
app.get('/', async (request, reply) => {
  return reply.view('index.pug', { message: 'Let\'s get started' });
});

// Start the server
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' }); // In Docker, the host should be 0.0.0.0 to allow external access.
    console.log('Server listening on https://localhost:3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

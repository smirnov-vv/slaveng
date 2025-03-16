// server/routes/example.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authentication from '../lib/authentication.js';

const routeLevelValidation = {
  schema: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', minLength: 5, maxLength: 40 },
        password: { type: 'string', minLength: 8, maxLength: 20 },
      },
    },
  },
};

export default async function userRoutes(fastify) {
  fastify.get(
    '/users',
    { preHandler: authentication },
    async (request, reply) => {
      const users = await User.query();
      return users;
    }
  );

  fastify.get('/users/new', async (request, reply) => {
    const isLoggedIn = request.cookies?.token ? true : false;
    return reply.view('/users/newuser.pug', { isLoggedIn });
  });

  fastify.post('/users', routeLevelValidation, async (request, reply) => {
    const { email, password } = request.body;
    const isLoggedIn = request.cookies?.token ? true : false;
    try {
      // Check if the user exists
      const user = await User.query().where('email', email).first();
      if (user) {
        return reply.status(401).view('index.pug', {
          title: 'The email already in use',
          message: 'Try again',
          isLoggedIn,
        });
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Insert the new user into the database
      const newUser = await User.query().insert({
        email,
        password: hashedPassword,
      });

      return reply.status(200).view('index.pug', {
        title: `Welcome, ${newUser.email.split('@')[0]}!`,
        message: '',
        isLoggedIn,
      });
    } catch (error) {
      console.error('Registering user error:', error);
      return reply.status(500).view('index.pug', {
        title: 'Failed to create user',
        message: 'Internal server error',
        isLoggedIn,
      });
    }
  });

  fastify.get('/session/new', async (request, reply) => {
    const isLoggedIn = request.cookies?.token ? true : false;
    return reply.view('/users/signin.pug', { isLoggedIn });
  });

  fastify.get(
    '/session/delete',
    { preHandler: authentication },
    async (request, reply) => {
      // Set the token in an HTTP-only cookie
      reply.clearCookie('token', {
        path: '/', // Ensure the cookie path matches the one used when setting the cookie
        httpOnly: true, // Match the cookie settings
        secure: true, // Match the cookie settings
        sameSite: 'strict', // Match the cookie settings
      });

      return reply.view('index.pug', {
        title: 'Hope to see you soon!',
        isLoggedIn: false,
      });
    }
  );

  fastify.post('/session', routeLevelValidation, async (request, reply) => {
    const { email, password } = request.body;
    const isLoggedIn = request.cookies?.token ? true : false;
    try {
      // Find the user
      const user = await User.query().where('email', email).first();
      if (!user) {
        return reply.status(401).view('index.pug', {
          title: 'User is not found',
          message: 'Try again',
          isLoggedIn,
        });
      }
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.status(401).view('index.pug', {
          title: 'Password is wrong',
          message: 'Try again',
          isLoggedIn,
        });
      }
      // Generate a JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      // Set the token in an HTTP-only cookie
      reply.setCookie('token', token, {
        httpOnly: true, // Prevent JavaScript access
        secure: true, // Only send over HTTPS
        sameSite: 'strict', // Prevent CSRF attacks
        path: '/', // Cookie is accessible across the entire site
        maxAge: 3600, // Cookie expiration time in seconds (1 hour)
      });

      return reply.status(200).view('index.pug', {
        title: `Welcome, ${user.email.split('@')[0]}!`,
        message: '',
        isLoggedIn: true,
      });
    } catch (error) {
      console.error('Signing in user error:', error);
      return reply.status(500).view('index.pug', {
        title: 'Failed to sign in',
        message: 'Internal server error',
        isLoggedIn,
      });
    }
  });
}

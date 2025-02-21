// server/routes/example.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const routeLevelValidation = {
  schema: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', minLength: 5, maxLength: 30 },
        password: { type: 'string', minLength: 8, maxLength: 20 },
      },
    },
  },
};

export default async function userRoutes(fastify) {
  fastify.get('/users', async (request, reply) => {
    const users = await User.query();
    return users;
  });

  fastify.get('/users/new', async (request, reply) => {
    return reply.view('/users/newuser.pug');
  });

  fastify.post('/users', routeLevelValidation, async (request, reply) => {
    const { email, password } = request.body;
  
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Insert the new user into the database
      const newUser = await User.query().insert({
        email,
        password: hashedPassword,
      });
  
      return reply.status(201).send(newUser); // Return the created user
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to create user', details: error.message });
    }
  });

  fastify.get('/session/new', async (request, reply) => {
    // some authentication logic
    return reply.view('/users/signin.pug');
  });

  fastify.get('/session/delete', async (request, reply) => {
    // some logic to end session
    return reply.view('index.pug', { message: 'Hope to see you soon' });
  });
}
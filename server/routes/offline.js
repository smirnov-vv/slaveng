export default async function userRoutes(fastify) {
  fastify.get('/offline', async (request, reply) => {
    return reply.view('/index.pug', {
      title: 'You are offline',
    });
  });
}

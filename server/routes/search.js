export default async function userRoutes(fastify) {
  fastify.get('/search', async (request, reply) => {
    const isLoggedIn = request.cookies?.token ? true : false;
    const search = request.query.content;
    const toPhoneticHTML =
      '<div id="toPhoneticsSpinner", class="spinner-border text-info" role="status"><span class="visually-hidden">Loading...</span></div>';
    const cambridgeHTML =
      '<div id="cambridgeSpinner", class="spinner-border text-info" role="status"><span class="visually-hidden">Loading...</span></div>';
    return reply.view('/index.pug', {
      title: 'Result for:',
      message: '',
      search,
      toPhoneticHTML,
      cambridgeHTML,
      isLoggedIn,
    });
  });
}

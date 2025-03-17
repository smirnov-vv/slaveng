const searchRoutes = async (fastify) => {
  fastify.get('/search', async (request, reply) => {
    const isLoggedIn = request.cookies?.token ? true : false;
    const search = request.query.content;
    // Remove html tags
    const withoutTags = search.replace(/<[^>]*>/g, '');
    // Replace all symbols used in XSS, excluding single quote, with space
    const sanitized = withoutTags.replace(/[<>"`&\/(){}=;:\\]/g, ' ');
    const toPhoneticHTML =
      '<div id="toPhoneticsSpinner", class="spinner-border text-info" role="status"><span class="visually-hidden">Loading...</span></div>';
    const cambridgeHTML =
      '<div id="cambridgeSpinner", class="spinner-border text-info" role="status"><span class="visually-hidden">Loading...</span></div>';
    return reply.view('/index.pug', {
      title: 'Result for:',
      message: '',
      search: sanitized,
      toPhoneticHTML,
      cambridgeHTML,
      isLoggedIn,
    });
  });
};

export default searchRoutes;

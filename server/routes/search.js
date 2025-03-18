const searchRoutes = async (fastify) => {
  fastify.get('/search', async (request, reply) => {
    const isLoggedIn = request.cookies?.token ? true : false;
    const search = request.query.content;
    // Remove html tags
    const withoutTags = search.replace(/<[^>]*>/g, '');
    // Replace all symbols used in XSS, excluding single quote, with space
    const sanitizedString = withoutTags.replace(/[<>`&\/(){}=;:\\]/g, ' ');
    const arrayOfWords = sanitizedString.split(' ');
    console.log(arrayOfWords);
    const arrayWithLinks = arrayOfWords.map((word) => {
      return `<a href="https://dictionary.cambridge.org/dictionary/english/${word.replace(/[".,?!]/g, '')}">${word}</a>`;
    });
    const requestWithLinks = arrayWithLinks.join(' ');
    console.log(requestWithLinks);
    const toPhoneticHTML =
      '<div id="toPhoneticsSpinner", class="spinner-border text-info" role="status"><span class="visually-hidden">Loading...</span></div>';
    const cambridgeHTML =
      '<div id="cambridgeSpinner", class="spinner-border text-info" role="status"><span class="visually-hidden">Loading...</span></div>';
    return reply.view('/index.pug', {
      title: 'Result for:',
      message: '',
      search: sanitizedString,
      requestWithLinks,
      toPhoneticHTML,
      cambridgeHTML,
      isLoggedIn,
    });
  });
};

export default searchRoutes;

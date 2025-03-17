import axios from 'axios';
import { JSDOM } from 'jsdom';

const timeout = 10000;

const createDomElement = (text) => {
  const dom = new JSDOM('<div></div>');
  const document = dom.window.document;
  const newElement = document.createElement('span');
  newElement.textContent = text;
  return newElement;
};

const getCambridgeIPA = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', // Set your custom User-Agent here
      },
      timeout,
    });
    const html = response.data;

    // Remove <link> and <style> tags
    const cleanedHtml = html.replace(
      /<link[^>]*>|<style[^>]*>[\s\S]*?<\/style>/gi,
      ''
    );
    const dom = new JSDOM(cleanedHtml);
    const document = dom.window.document;
    const firstSection = document.querySelector('.pr.dictionary');
    const transcriptionOutputDOM = firstSection
      ? firstSection.querySelectorAll('.pos-header.dpos-h')
      : [];
    const getList = () => {
      return [...transcriptionOutputDOM].reduce(
        (acc, word) => {
          const partOfSpeech = word?.querySelector('.pos.dpos')?.textContent;
          const ukIPA = word
            ?.querySelector('.uk.dpron-i')
            ?.querySelector('.ipa').innerHTML; //.textContent;
          const usIPA = word
            ?.querySelector('.us.dpron-i')
            ?.querySelector('.ipa').innerHTML; //.textContent;
          if (partOfSpeech) {
            acc.push([partOfSpeech, ukIPA, usIPA]);
          }
          return acc;
        },
        [] // initial acc
      );
    };
    const result =
      getList().length > 0 ? getList() : createDomElement('Not found');
    return result;
  } catch (error) {
    console.error(`getCambridgeIPA error: ${error.message}`);
    return createDomElement(error.message);
  }
};

const getCambridgeHTML = (cambridgeIPA) => {
  const IPAset = Array.isArray(cambridgeIPA) ? cambridgeIPA : [];
  const output = IPAset.reduce(
    (acc, partOfSpeech) => {
      acc += `<b>${partOfSpeech[0]}:<br></b>uk: ${partOfSpeech[1]}<br>us: ${partOfSpeech[2]}<br><br>`;
      return acc;
    },
    '' // initial acc
  );
  return output.length > 0 ? output : cambridgeIPA.textContent;
};

const getToPhoneticsDOM = async (url, options) => {
  try {
    const response = await axios.post(url, options, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Match the form's content type
      },
      timeout,
    });
    const html = response.data;
    // Remove <link> and <style> tags
    const cleanedHtml = html.replace(
      /<link[^>]*>|<style[^>]*>[\s\S]*?<\/style>/gi,
      ''
    );
    const dom = new JSDOM(cleanedHtml);
    const document = dom.window.document;
    const transcriptionOutputDOM = document.getElementById('transcr_output');
    return transcriptionOutputDOM;
  } catch (error) {
    console.error(`getToPhoneticsDOM error: ${error.message}`);
    return createDomElement(error.message);
  }
};

const getPhoneticData = (DOM) => {
  const wordsWithMultipleIPA = DOM ? [...DOM?.querySelectorAll('a')] : [];
  const ipaVariantsData = wordsWithMultipleIPA.reduce(
    (acc, word) => {
      const id = word.getAttribute('id');
      const variantsRaw = word.getAttribute('title');
      const pattern = /\[(.*?)\]/g; // Pattern to extract substrings between brackets "[" and "]" including them
      const variantsWithBrackets = variantsRaw.match(pattern);
      const variantsInArray = variantsWithBrackets
        ? variantsWithBrackets.map((item) => item.slice(1, -1)) // Remove "[" and "]"
        : [];
      acc[id] = variantsInArray;
      return acc;
    },
    {} // initial acc
  );
  return ipaVariantsData;
};

const requestRoutes = async (fastify) => {
  fastify.get('/cambridge', async (request, reply) => {
    const search = request.query.content;
    const url = `https://dictionary.cambridge.org/dictionary/english/${search}`;
    const cambridgeIPA = await getCambridgeIPA(url);
    const cambridgeHTML = getCambridgeHTML(cambridgeIPA);
    reply.send(cambridgeHTML);
  });

  fastify.get('/tophonetics', async (request, reply) => {
    const search = request.query.content;
    const options = {
      text_to_transcribe: search,
      weak_forms: 'on',
      submit: 'Show transcription',
    };

    const toPhoneticDOM = await getToPhoneticsDOM(
      'https://tophonetics.com/',
      options
    );
    // replace attribute for tooltip to handle html
    const toPhoneticHTML = toPhoneticDOM?.innerHTML?.replaceAll(
      'data-html',
      'data-bs-html'
    );
    const phoneticVariants = getPhoneticData(toPhoneticDOM);
    reply.send({
      toPhoneticHTML,
      phoneticVariants,
    });
  });
};

export default requestRoutes;

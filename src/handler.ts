import * as cheerio from 'cheerio';

exports.hello = async (event) => {
  const res = await fetch(
    event.queryStringParameters?.url,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
      }
    }
  );
  const html = await res.text();

  const $ = cheerio.load(html);
  const imageSrc = $('.EmbeddedMediaImage').attr('src');
  const caption = $('.Caption').text().trim();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
      igUrl: event.queryStringParameters?.url,
      imageUrl: imageSrc,
      caption: caption,
    }),
  };
};

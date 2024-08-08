require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

const urls = {}; //URL storage
let urlCount = 1;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;

  const urlRegex = /^https?:\/\/([\w.-]+)+/;
  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  const hostname = new URL(url).hostname;

  dns.lookup(hostname, (err) => {
    if(err)
      return res.json({ error: "invalid url" });

    const shortUrl = urlCount++;
    urls[shortUrl] = url;
    res.json({ original_url: url, short_url: shortUrl });
  });
});

app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const origionalUrl = urls[shortUrl];
  if(origionalUrl) {
    res.redirect(origionalUrl);
  } else {
    res.json({ error: "No short URL found"});
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

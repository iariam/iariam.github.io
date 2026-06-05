const TMDB_KEY = 'c4917444555b20e99fcd0d2dc5415111';

module.exports = async (req, res) => {
  const { type, id } = req.query;
  if (!type || !id || !['movie','show'].includes(type)) {
    return res.status(404).send('Not found');
  }

  const tmdbType = type === 'show' ? 'tv' : 'movie';

  try {
    const r = await fetch(
      `https://api.themoviedb.org/3/${tmdbType}/${id}?api_key=${TMDB_KEY}`
    );
    const d = await r.json();

    const title   = (d.title || d.name || 'StreamUp').replace(/"/g, '&quot;');
    const poster  = d.poster_path
      ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : '';
    const desc    = (d.overview || 'Open in StreamUp to watch.')
      .slice(0, 220).replace(/"/g, '&quot;');
    const year    = (d.release_date || d.first_air_date || '').slice(0, 4);
    const deepLink = `streamup://${type}/${id}`;
    const host    = req.headers.host;
    const canon   = `https://${host}/${type}/${id}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}${year ? ` (${year})` : ''} — StreamUp</title>
<meta property="og:type"        content="${tmdbType==='movie'?'video.movie':'video.tv_show'}"/>
<meta property="og:site_name"   content="StreamUp"/>
<meta property="og:title"       content="${title}${year ? ` (${year})` : ''}"/>
<meta property="og:description" content="${desc}"/>
${poster ? `<meta property="og:image" content="${poster}"/>` : ''}
<meta property="og:url"         content="${canon}"/>
<meta name="twitter:card"  content="summary_large_image"/>
<meta name="twitter:title" content="${title}${year ? ` (${year})` : ''}"/>
${poster ? `<meta name="twitter:image" content="${poster}"/>` : ''}
</head>
<body style="background:#08080f;color:#fff;font-family:-apple-system,sans-serif;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:100vh;text-align:center;padding:24px;margin:0;box-sizing:border-box">
${poster
  ? `<img src="${poster}" style="width:160px;border-radius:14px;margin-bottom:20px;
       box-shadow:0 12px 40px rgba(0,0,0,.7)">`
  : '<div style="font-size:56px;margin-bottom:16px">▶️</div>'}
<h1 style="font-size:22px;font-weight:700;margin:0 0 6px">${title}</h1>
${year ? `<p style="color:rgba(255,255,255,.45);margin:0 0 28px;font-size:14px">${year}</p>` : '<div style="height:28px"></div>'}
<a href="${deepLink}"
   style="background:#57c7f2;color:#000;font-weight:700;font-size:16px;
          padding:14px 34px;border-radius:100px;text-decoration:none">
  Open in StreamUp
</a>
<p style="margin-top:16px;font-size:11px;color:rgba(255,255,255,.25)">StreamUp</p>
</body>
</html>`);
  } catch(e) {
    res.status(500).send('Error fetching title data.');
  }
};

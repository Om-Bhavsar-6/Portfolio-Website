module.exports = async function repoHandler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "GITHUB_TOKEN environment variable is missing" }));
    return;
  }

  // Parse repo name from query string e.g. ?name=Komalpreet2809/SOMA
  const urlParts = req.url.split('?');
  const searchParams = new URLSearchParams(urlParts[1] || '');
  const repoName = searchParams.get('name');

  if (!repoName) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Missing repo name" }));
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repoName}`, {
      method: 'GET',
      headers: {
        'Authorization': `bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-App'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `GitHub API responded with ${response.status}`);
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.end(JSON.stringify({
      stargazers_count: data.stargazers_count,
      pushed_at: data.pushed_at
    }));

  } catch (error) {
    console.error("GitHub Repo API error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Failed to fetch GitHub repo data" }));
  }
};

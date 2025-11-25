// app/api/video/route.js
export async function GET() {
  const WP_JSON_URL = 'https://надувное-шоу.рф/wp-json/wp/v2/media?per_page=10&media_type=video&_fields=source_url';

  try {
    const res = await fetch(WP_JSON_URL);

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `WP returned ${res.status}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();

    const videos = data.map((item, idx) => ({
      id: idx,
      source_url: item.source_url
    }));

    return new Response(JSON.stringify(videos), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('API fetch failed:', err);
    return new Response(JSON.stringify({ error: 'fetch failed', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

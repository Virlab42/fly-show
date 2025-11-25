export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400 });
    }

    const WC_URL = 'https://xn----7sbghg8bdic8bg2d.xn--p1ai/wp-json/wc/v3';
    const WC_KEY = 'ck_5d2dc332117170fc2f1b3ba437c9fa84291b0a23';
    const WC_SECRET = 'cs_d5421f693ce776c4f371f3afad2ed3c783b5b50f';

    const auth = `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')}`;

    const response = await fetch(`${WC_URL}/products/${productId}/variations?per_page=100`, {
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('WooCommerce API error:', text);
      return new Response(JSON.stringify({ error: 'Failed to fetch variations', details: text }), { status: 500 });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500 });
  }
}

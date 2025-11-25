export async function GET() {
  try {
    const allProducts = [];
    let page = 1;
    const perPage = 20;

    while (true) {
      const url = `https://xn----7sbghg8bdic8bg2d.xn--p1ai/wp-json/wc/v3/products?page=${page}&per_page=${perPage}&status=publish&orderby=menu_order&order=asc&consumer_key=ck_5d2dc332117170fc2f1b3ba437c9fa84291b0a23&consumer_secret=cs_d5421f693ce776c4f371f3afad2ed3c783b5b50f`;


      const res = await fetch(url, {
        // ✅ кэшируем на сервере 10 минут
        next: { revalidate: 6000 },
        headers: {
          'User-Agent': 'NextFetch/1.0',
          'Accept': 'application/json'
        },
      });

      if (!res.ok) {
        console.error(`Ошибка загрузки страницы ${page}: ${res.status}`);
        break;
      }

      const products = await res.json();

      if (!products.length) break;

      allProducts.push(...products);
      page++;

      if (page > 20) break;
    }

    return new Response(JSON.stringify(allProducts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
    return new Response(JSON.stringify({ error: 'Ошибка подключения к WordPress' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

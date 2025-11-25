export async function GET() {
  try {
    const headers = {
      Authorization: `Basic ${btoa('ck_5d2dc332117170fc2f1b3ba437c9fa84291b0a23:cs_d5421f693ce776c4f371f3afad2ed3c783b5b50f')}`,
    };

    // Получаем тег "Новинки"
    const tagRes = await fetch('https://xn----7sbghg8bdic8bg2d.xn--p1ai/wp-json/wc/v3/products/tags', { headers });
    const tags = await tagRes.json();
    const newTag = tags.find(t => t.name === 'Новинки');
    if (!newTag) {
      return Response.json([], { status: 200 });
    }

    let allProducts = [];
    let page = 1;
    const perPage = 10; // 👈 ещё безопаснее

    while (true) {
      const url = `https://xn----7sbghg8bdic8bg2d.xn--p1ai/wp-json/wc/v3/products?page=${page}&per_page=${perPage}&tags=${newTag.id}&status=publish`;
      const res = await fetch(url, { headers, cache: 'no-store' });

      if (!res.ok) {
        console.warn(`Ошибка ${res.status} на странице ${page}`);
        break;
      }

      const text = await res.text();
      if (text.startsWith('<')) break;

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn(`Ошибка парсинга на странице ${page}`);
        break;
      }

      if (!Array.isArray(data) || data.length === 0) break;

      allProducts = [...allProducts, ...data];
      if (data.length < perPage) break;
      page++;

      // антиперегрузка WooCommerce
      await new Promise(r => setTimeout(r, 300));
    }

    return Response.json(allProducts.filter(p => p.stock_status === 'instock'));
  } catch (err) {
    console.error('Ошибка API:', err);
    return Response.json({ error: 'Ошибка при загрузке товаров' }, { status: 500 });
  }
}

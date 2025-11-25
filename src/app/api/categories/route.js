// app/api/categories/route.js  (пример пути)
let cached = null;
let lastFetch = 0;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 часов

export async function GET() {
  const now = Date.now();
  if (cached && now - lastFetch < CACHE_TTL) {
    return new Response(JSON.stringify(cached), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const WP_JSON_URL = 'https://надувное-шоу.рф/wp-json/wc/v3/products/categories?per_page=100';
    const res = await fetch(WP_JSON_URL, {
      headers: {
        Authorization: `Basic ${Buffer.from('ck_5d2dc332117170fc2f1b3ba437c9fa84291b0a23:cs_d5421f693ce776c4f371f3afad2ed3c783b5b50f').toString('base64')}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `WP returned ${res.status}` }), { status: 500 });
    }

    const data = await res.json();

    // Если в объектах есть menu_order, сортируем по нему.
    // Категории с явно заданным menu_order идут первыми (меньшее значение = раньше).
    // Те, у кого menu_order отсутствует, попадут в конец.
    const sorted = (Array.isArray(data) ? data.slice() : [])
      .sort((a, b) => {
        const aHas = typeof a.menu_order !== 'undefined' && a.menu_order !== null;
        const bHas = typeof b.menu_order !== 'undefined' && b.menu_order !== null;

        if (aHas && bHas) {
          return Number(a.menu_order) - Number(b.menu_order);
        }
        if (aHas && !bHas) return -1; // a имеет порядок — пусть идёт раньше
        if (!aHas && bHas) return 1;  // b имеет порядок — a позже
        // если ни у кого нет, сортируем по name как fallback
        return String(a.name || '').localeCompare(String(b.name || ''));
      });

    cached = sorted;
    lastFetch = now;

    return new Response(JSON.stringify(sorted), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    // при ошибке возвращаем кэш, если есть
    if (cached) {
      return new Response(JSON.stringify(cached), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500 });
  }
}

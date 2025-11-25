export const dynamic = 'force-dynamic';
import ClientFilters from './client';

async function fetchItemById(id) {
    const url = `https://xn----7sbghg8bdic8bg2d.xn--p1ai/wp-json/wc/v3/products/${id}?per_page=20&status=publish&consumer_key=ck_5d2dc332117170fc2f1b3ba437c9fa84291b0a23&consumer_secret=cs_d5421f693ce776c4f371f3afad2ed3c783b5b50f`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Ошибка загрузки товара');
    return res.json();
}

export async function generateMetadata({ searchParams  }) {
    const id = searchParams?.id;
    let item = null;

    try {
        item = await fetchItemById(id);
    } catch (error) {
        console.error(error);
        return {
            title: 'Ошибка',
            description: 'Не удалось загрузить товар',
        };
    }
    return {
        title: item.yoast_head_json.title,
        description: item.yoast_head_json.description,
        alternates: {
            canonical: `https://твой-сайт/products/product-info/podushki/${encodeURIComponent(item.name)}?id=${item.id}`
        },
        openGraph: {
            title: item.yoast_head_json.title,
            description: item.yoast_head_json.description,
            url: `https://твой-сайт/products/product-info/podushki/${encodeURIComponent(item.name)}?id=${item.id}`,
            images: [
                {
                    url: item.images?.[0]?.src || '/no-image.png',
                    alt: item.name,
                },
            ],
        },
    };
}

export default async function Page({ searchParams }) {
    const id = searchParams?.id;
    let item = null;

    try {
        item = await fetchItemById(id);
    } catch (error) {
        console.error(error);
        return <p>Ошибка загрузки данных</p>;
    }

    return (
            <ClientFilters items={item} />
    );
}
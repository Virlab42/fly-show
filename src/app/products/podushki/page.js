export const dynamic = 'force-dynamic';
import ClientFilters from './client'



export async function generateMetadata() {
    const title = 'Надувное шоу, реквизит и костюмы для ивентов, брендов и компаний';
    const description = 'Широкий ассортимент подушек и аттракционов для праздников, мероприятий и ивентов. Идеально для аниматоров, event-агентств, подрядчиков и государственных мероприятий.';

    return {
        title,
        description,
        alternates: {
            canonical: `https://naduvnoeshow.ru/products/podushki`,
        },
        openGraph: {
            title,
            description,
            url: `https://naduvnoeshow.ru/products/podushki`,
            images: [
                {
                    url: `/favicon/web-app-manifest-512x512.png`,
                    alt: `Подушки`,
                },
            ],
        },
    };
}

export default async function Page() {
    

    return (
        <div className="products-container">
            <ClientFilters items={[]} />
        </div>
    );
}

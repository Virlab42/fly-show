import db from "@/lib/db";

export async function POST(req) {
    try {
        const body = await req.json();
        const { priceRange, colors, nalichie, category } = body;

        const conditions = [];
        const params = [];

        if (priceRange) {
            conditions.push('price BETWEEN ? AND ?');
            params.push(priceRange.min, priceRange.max);
        }

        if (colors && colors.length > 0) {
            const placeholders = colors.map(() => '?').join(',');
            conditions.push(`color IN (${placeholders})`);
            params.push(...colors);
        }


        if (nalichie !== null && nalichie !== undefined) {
            conditions.push('nalichie = ?');
            params.push(nalichie);
        }

        if (category && category.length > 0) {
            const placeholders = category.map(() => '?').join(',');
            conditions.push(`category_name IN (${placeholders})`);
            params.push(...category);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const [rows] = await db.query(
            `SELECT Exclusive.*, Iqos_category.category_name FROM Exclusive
             JOIN Iqos_category ON Exclusive.id_category = Iqos_category.id
             ${whereClause}`,
            params
        );

        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error.message, error.stack);
        return new Response(JSON.stringify({ error: 'Ошибка выполнения запроса', details: error.message }), { status: 500 });
    }
}

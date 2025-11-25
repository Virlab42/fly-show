import db from "@/lib/db";
export async function POST(req) {
    try {
        const body = await req.json();
        const { filters, countries, sort, search } = body;
        const { priceRange, flavors, strengths, hasCapsule, nalichie, countrys, hit, brend } = filters;

        let query = `
            SELECT Terea.*, Terea_category.category_name 
            FROM Terea
            JOIN Terea_category ON Terea.terea_id = Terea_category.id
        `;

        const conditions = [];
        const params = [];

        if (priceRange && priceRange.min !== undefined && priceRange.max !== undefined) {
            conditions.push('price BETWEEN ? AND ?');
            params.push(priceRange.min, priceRange.max);
        }

        if (brend && brend.length > 0) {
            const placeholders = brend.map(() => '?').join(',');
            conditions.push(`brend IN (${placeholders})`);
            params.push(...brend);
        }

        if (countrys && countrys.length > 0) {
            const placeholders = countrys.map(() => '?').join(',');
            conditions.push(`country IN (${placeholders})`);
            params.push(...countrys);
        }

        if (flavors && flavors.length > 0) {
            const flavorConditions = flavors.map(() => `FIND_IN_SET(?, flavor) > 0`).join(' OR ');
            conditions.push(`(${flavorConditions})`);
            params.push(...flavors);
        }

        if (strengths && strengths.length > 0) {
            const placeholders = strengths.map(() => '?').join(',');
            conditions.push(`strength IN (${placeholders})`);
            params.push(...strengths);
        }

        if (hasCapsule !== null && hasCapsule !== undefined) {
            conditions.push('has_capsule = ?');
            params.push(hasCapsule);
        }

        if (hit !== null && hit !== undefined) {
            conditions.push('hit = ?');
            params.push(hit);
        }

        if (nalichie !== null && nalichie !== undefined) {
            conditions.push('nalichie = ?');
            params.push(nalichie);
        }

        if (countries && countries.length > 0) {
            const placeholders = countries.map(() => '?').join(',');
            conditions.push(`category_name IN (${placeholders})`);
            params.push(...countries);
        }

        if (search) {
            conditions.push('name LIKE ?');
            params.push(`%${search}%`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        if (sort && sort !== 'default') {
            const sortOrder = sort === 'ascending' ? 'ASC' : (sort === 'descending' ? 'DESC' : 'ASC');
            query += ` ORDER BY price ${sortOrder}`;
        }

        const [rows] = await db.query(query, params);
        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error.message, error.stack);
        return new Response(JSON.stringify({ error: 'Ошибка выполнения запроса', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
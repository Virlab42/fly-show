import db from "@/lib/db";

const TABLES = {
    terea: "Terea",
    iqos: "Iqos",
    devices: "Devices",
    exclusive: "Exclusive",
};


export async function GET(req, { params }) {
    const { type, ref } = await params;

    if (!type || !ref) {
        return new Response(JSON.stringify({ error: "Параметры type и ref обязательны" }), {
            status: 400,
        });
    }

    const table = TABLES[type.toLowerCase()];

    if (!table) {
        return new Response(JSON.stringify({ error: "Неверный тип товара" }), { status: 400 });
    }

    try {
        const [rows] = await db.query(`SELECT * FROM ${table} WHERE ref = ?`, [ref]);

        if (rows.length === 0) {
            return new Response(JSON.stringify({ error: "Товар не найден" }), { status: 404 });
        }

        return new Response(JSON.stringify(rows[0]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Ошибка сервера" }), { status: 500 });
    }
}

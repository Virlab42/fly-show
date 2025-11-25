import db from "@/lib/db";

export async function GET(req) {
    try {
        const [tereaRows] = await db.query("SELECT * FROM Terea WHERE hit = true");
        const [iqosRows] = await db.query("SELECT * FROM Iqos WHERE hit = true");
        const [deviceRows] = await db.query("SELECT * FROM Devices WHERE hit = true");

        const result = {
            terea: tereaRows,
            iqos: iqosRows,
            device: deviceRows
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "Ошибка подключения к базе данных" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

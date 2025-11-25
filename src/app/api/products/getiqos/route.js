import db from "@/lib/db";


export async function GET(req){
    try{
        const [rows] = await db.query("SELECT * FROM Iqos")
        return new Response(JSON.stringify(rows),{
            status:200,
            headers:{'Content-Type':'application/json'},
        })
    }catch(error){
        console.log(error)
        return new Response(JSON.stringify({error:'Ошибка подключения к базе данных'}),{
            status:500,
            headers:{'Content-Type':'application/json'},
        })
    }
}
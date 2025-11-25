import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: '82.148.31.38',
    user:'phpmyadmin',
    password:'Admin@7681',
    database:'iluma',
    port:'3306'
})

export default pool
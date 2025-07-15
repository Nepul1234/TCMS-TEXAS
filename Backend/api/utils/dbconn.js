import mysql from 'mysql2/promise';
import fs from 'fs';

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'mysqlserver1099.mysql.database.azure.com',
    user:'testadmin',
    password: 'Admin@1111',
    database: 'texas',
    port: '3306',
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem", "utf8")
    }
  });

pool.getConnection((err, connection)=>{
    if(err) throw err;
    console.log("Database connected");
    connection.release();   
});

export default pool;
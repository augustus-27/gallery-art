const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(express.static('public'));

app.get('/', async (req, res) => {
    const folders = ['chup-mh', 'medipaint']; 
    let allHtml = "";
    for (const folder of folders) {
        const folderPath = path.join(__dirname, 'public', folder);
        try {
            const files = fs.readdirSync(folderPath);
            const imageFiles = files.filter(file => {
                const f = file.toLowerCase();
                return f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.gif');
            });
            let imgTags = "";
            imageFiles.forEach(fileName => {
                imgTags += `
                    <div style="margin: 10px; display: inline-block; background: white; padding: 10px; border-radius: 8px; shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <img src="/${folder}/${fileName}" width="250" style="border-radius: 4px;">
                        <p style="font-size: 12px; color: #888;">${fileName}</p>
                    </div>`;
            });
            allHtml += `
                <section style="margin-bottom: 50px; border-top: 2px solid #ddd; padding-top: 20px;">
                    <h2 style="text-transform: uppercase; color: #444;">📁 Thư mục: ${folder}</h2>
                    <div class="gallery">${imgTags || "<p>Trống trơn...</p>"}</div>
                </section>`;
        } catch (err) {
            allHtml += `<h3>⚠️ Không tìm thấy thư mục: ${folder}</h3>`;
        }
    }
    res.send(`
        <html>
            <body style="text-align: center; font-family: sans-serif; background: #f9f9f9; padding: 20px;">
                <h1 style="color: #2c3e50;">🖼️ Triển Lãm Tổng Hợp</h1>
                ${allHtml}
                <p><a href="/">Làm mới toàn bộ</a></p>
            </body>
        </html>
    `);
});
app.listen(3000, () => console.log("Server đa mục đang chạy tại localhost:3000"));
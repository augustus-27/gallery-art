const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const config = {
    user: 'sa',
    password: '123456789', 
    server: '127.0.0.1', 
    database: 'MyGalleryDB',
    port: 1433, 
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

app.get('/', async (req, res) => {
    let allHtml = "";
    try {
        await sql.connect(config);
        const result = await sql.query("SELECT * FROM Resources WHERE user_id = 1 ORDER BY res_id DESC");
        
        let sqlImgTags = "";
        result.recordset.forEach(item => {
            sqlImgTags += `
                <div style="margin: 10px; display: inline-block; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 280px; vertical-align: top;">
                    <img src="${item.url}" width="100%" style="border-radius: 8px;">
                    <p style="font-size: 14px; color: #1a73e8; font-weight: bold; margin-top: 10px;"> ${item.title}</p>
                    <p style="font-size: 13px; color: #555; font-style: italic; background: #f0f7ff; padding: 5px; border-radius: 4px;">
                        "${item.status || 'Không có trạng thái'}"
                    </p>
                    <p style="font-size: 11px; color: #aaa;">ID: ${item.res_id}</p>

                    <form action="/delete" method="POST" style="margin-top: 10px;">
                        <input type="hidden" name="id" value="${item.res_id}">
                        <button type="submit" style="background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold;">Xóa ảnh này</button>
                    </form>
                </div>`;
        });
        allHtml += `
            <section style="margin-bottom: 50px; background: #eef6ff; padding: 20px; border-radius: 15px;">
                <h2 style="text-transform: uppercase; color: #1a73e8;">☁️ Nguồn: Trust me bro </h2>
                <div class="gallery">${sqlImgTags || "<p>Chưa có ảnh trong Database.</p>"}</div>
            </section>`;
            
    } catch (err) {
        allHtml += `<div style="color: red; padding: 20px; border: 1px solid red;">⚠️ Lỗi kết nối SQL: ${err.message}</div>`;
    }

    const folders = ['chup-mh', 'medipaint']; 
    for (const folder of folders) {
        const folderPath = path.join(__dirname, 'public', folder);
        try {
            const files = fs.readdirSync(folderPath);
            const imageFiles = files.filter(file => {
                const f = file.toLowerCase();
                return f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg');
            });
            let imgTags = "";
            imageFiles.forEach(fileName => {
                imgTags += `
                    <div style="margin: 10px; display: inline-block; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <img src="/${folder}/${fileName}" width="250" style="border-radius: 4px;">
                        <p style="font-size: 12px; color: #888;">${fileName}</p>
                    </div>`;
            });
            allHtml += `
                <section style="margin-bottom: 50px; border-top: 2px solid #ddd; padding-top: 20px;">
                    <h2 style="text-transform: uppercase; color: #444;">📁 Thư mục Local: ${folder}</h2>
                    <div class="gallery">${imgTags || "<p>Trống trơn...</p>"}</div>
                </section>`;
        } catch (err) {
            allHtml += `<h3>⚠️ Không tìm thấy thư mục: ${folder}</h3>`;
        }
    }

res.send(`
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="text-align: center; font-family: sans-serif; background: #f9f9f9; padding: 20px;">
                <h1 style="color: #2c3e50;"> Ổ lưu if máy dở chứng cần đem đi sửa </h1>

                <div style="background: #fff; padding: 20px; border-radius: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 40px; border: 2px solid #28a745;">
                    <h3 style="color: #28a745; margin-top: 0;">➕ Đưa tranh lên kệ</h3>
                    <form action="/add" method="POST" id="upload-form">
                        <input type="text" name="title" placeholder="Tên tranh..." required style="padding: 10px; margin: 5px; border-radius: 5px; border: 1px solid #ddd; width: 250px;"><br>
                        
                        <div id="drop-area" style="border: 2px dashed #ccc; border-radius: 10px; padding: 20px; margin: 10px auto; width: 250px; cursor: pointer; background: #fafafa;">
                            <p id="preview-text" style="font-size: 13px; color: #888;">Click vào đây rồi nhấn <b>Ctrl + V</b> để dán ảnh</p>
                            <img id="img-preview" src="" style="width: 100%; display: none; border-radius: 5px; margin-top: 10px;">
                            <input type="hidden" name="url" id="image-data">
                        </div>

                        <input type="text" name="status" placeholder="Trạng thái/Cảm nghĩ..." style="padding: 10px; margin: 5px; border-radius: 5px; border: 1px solid #ddd; width: 250px;"><br>
                        <button type="submit" style="background: #28a745; color: white; border: none; padding: 10px 30px; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 10px;">ĐĂNG TRANH</button>
                    </form>
                </div>

                ${allHtml}

                <script>
                    document.addEventListener('paste', function (e) {
                        const items = e.clipboardData.items;
                        for (let i = 0; i < items.length; i++) {
                            if (items[i].type.indexOf('image') !== -1) {
                                const blob = items[i].getAsFile();
                                const reader = new FileReader();
                                reader.onload = function (event) {
                                    const base64String = event.target.result;
                                    document.getElementById('img-preview').src = base64String;
                                    document.getElementById('img-preview').style.display = 'block';
                                    document.getElementById('preview-text').style.display = 'none';
                                    document.getElementById('image-data').value = base64String;
                                };
                                reader.readAsDataURL(blob);
                            }
                        }
                    });
                </script>
            </body>
        </html>
    `);
});


app.listen(3000, () => console.log("🚀 Server đang chạy tại http://localhost:3000"));

app.post('/add', async (req, res) => {
    try {
        const { title, url, status } = req.body;
        let pool = await sql.connect(config);
        await pool.request()
            .input('t', sql.NVarChar, title)
            .input('u', sql.VarChar, url)
            .input('s', sql.NVarChar, status)
            .query("INSERT INTO Resources (title, url, res_type, user_id, status) VALUES (@t, @u, 'image', 1, @s)");
        res.redirect('/'); 
    } catch (err) {
        res.send("Lỗi khi thêm: " + err.message);
    }
});

app.post('/delete', async (req, res) => {
    try {
        const id = req.body.id;
        let pool = await sql.connect(config);
        await pool.request().query("DELETE FROM Resources WHERE res_id = " + id);
        res.redirect('/'); // Xóa xong load lại trang
    } catch (err) {
        res.send("Lỗi khi xóa: " + err.message);
    }
});

app.listen(3000, () => console.log("🚀 Server đang chạy tại http://localhost:3000"));
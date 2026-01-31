const express = require("express");
const mysql = require("mysql2");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

/* =======================
   MIDDLEWARE
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* =======================
   DATABASE CONNECTION
   (Render ke liye env use karna)
======================= */
const db = mysql.createConnection({
    host: "mysql-1921d3e-txnishkumar15.g.aivencloud.com",
    user: "avnadmin",
    password: "AVNS_sGhwRQTy8dydVea69d6",
    database: "defaultdb",
    port: 11737,
  ssl: {
    ca: fs.readFileSync(__dirname + "/ca.pem")
  },
  connectTimeout: 10000
});

db.connect(err => {
    if (err) {
        console.log("❌ Database Connection Failed");
        console.log(err);
    } else {
        console.log("✅ MySQL Connected");
    }
});

/* =======================
   HOME ROUTE (optional)
======================= */
app.get("/", (req, res) => {
    res.send("Student Certificate Verification System Running");
});

/* =======================
   VERIFY STUDENT DATA
   (QR scan ke baad yahi open hoga)
======================= */
app.get("/verify/:id", (req, res) => {
    const id = req.params.id;

    const sql = "SELECT * FROM student WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.send("Server Error");
        }

        if (result.length === 0) {
            return res.send("❌ Invalid or Fake Certificate");
        }

        res.render("verify", {
            student: result[0]
        });
    });
});

/* =======================
   GENERATE QR FOR STUDENT
======================= */
app.get("/generate-qr/:id", async (req, res) => {
    try {
        const studentId = req.params.id;

        const verifyURL = `https://${req.get("host")}/verify/${studentId}`;

        const qrImage = await QRCode.toDataURL(verifyURL);

        res.send(`
      <h2>QR Code for Student ID: ${studentId}</h2>
      <img src="${qrImage}" />
      <p>${verifyURL}</p>
    `);
    } catch (error) {
        res.send("QR Generation Failed");
    }
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

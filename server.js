
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const db = require("./db");

app.use(cors());
app.use(express.json());

// Serve frontend files from public folder
app.use(express.static("public"));
// ==============================
// EMAIL NOTIFICATION
// ==============================

async function sendLowStockEmail(product) {
    const { EMAIL_USER, EMAIL_PASS, EMAIL_TO } = process.env;

    if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
        console.log("Email settings are not configured yet.");
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: EMAIL_USER,
            to: EMAIL_TO,
            subject: `Low Stock Alert: ${product.name}`,
            text: `Low stock alert!

Product: ${product.name}
Current Quantity: ${product.quantity}
Minimum Stock: ${product.min_stock}

Please restock this product.`
        });

        console.log("Low stock email sent successfully.");
        return true;

    } catch (error) {
        console.error("Email sending failed:", error.message);
        return false;
    }
}

// Check backend
app.get("/api/test", (req, res) => {
    res.json({
        message: "Inventory Management Backend is running!"
    });
});

// Check MySQL connection
app.get("/api/db-test", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            message: "MySQL connected successfully!"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "MySQL connection failed"
        });
    }
});

// ==============================
// PRODUCTS
// ==============================

// Get all products
app.get("/api/products", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM products"
        );

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch products"
        });
    }
});

// Add product
app.post("/api/products", async (req, res) => {
    try {
        const { name, price, quantity, minStock } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            price === "" || price === undefined ||
            quantity === "" || quantity === undefined ||
            minStock === "" || minStock === undefined
        ) {
            return res.status(400).json({
                message: "Please fill all product details"
            });
        }

        const productPrice = Number(price);
        const productQuantity = Number(quantity);
        const minimumStock = Number(minStock);

        if (
            !Number.isFinite(productPrice) ||
            productPrice < 0 ||
            !Number.isInteger(productQuantity) ||
            productQuantity < 0 ||
            !Number.isInteger(minimumStock) ||
            minimumStock < 0
        ) {
            return res.status(400).json({
                message: "Enter valid product details"
            });
        }

        const [result] = await db.query(
            `INSERT INTO products
            (name, quantity, price, min_stock)
            VALUES (?, ?, ?, ?)`,
            [
                name.trim(),
                productQuantity,
                productPrice,
                minimumStock
            ]
        );

        res.status(201).json({
            message: "Product added successfully!",
            id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add product"
        });
    }
});

// Update product
app.put("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, quantity, minStock } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        if (
            typeof name !== "string" ||
            !name.trim() ||
            price === "" || price === undefined ||
            quantity === "" || quantity === undefined ||
            minStock === "" || minStock === undefined
        ) {
            return res.status(400).json({
                message: "Please fill all product details"
            });
        }

        const productPrice = Number(price);
        const productQuantity = Number(quantity);
        const minimumStock = Number(minStock);

        if (
            !Number.isFinite(productPrice) ||
            productPrice < 0 ||
            !Number.isInteger(productQuantity) ||
            productQuantity < 0 ||
            !Number.isInteger(minimumStock) ||
            minimumStock < 0
        ) {
            return res.status(400).json({
                message: "Enter valid product details"
            });
        }
        const [oldProducts] = await db.query(
    "SELECT id, name, quantity, min_stock FROM products WHERE id = ?",
    [id]
);

if (oldProducts.length === 0) {
    return res.status(404).json({
        message: "Product not found"
    });
}

const oldProduct = oldProducts[0];

        const [result] = await db.query(
            `UPDATE products
            SET name=?, price=?, quantity=?, min_stock=?
            WHERE id=?`,
            [
                name.trim(),
                productPrice,
                productQuantity,
                minimumStock,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        // Send email if updated stock becomes low
if (
    Number(oldProduct.quantity) > Number(oldProduct.min_stock) &&
    productQuantity <= minimumStock
) {
    await sendLowStockEmail({
        name: name.trim(),
        quantity: productQuantity,
        min_stock: minimumStock
    });
}

        res.json({
            message: "Product updated successfully!"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update product"
        });
    }
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const [result] = await db.query(
            "DELETE FROM products WHERE id=?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully!"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete product"
        });
    }
});

// ==============================
// CUSTOMERS
// ==============================

// Get all customers
app.get("/api/customers", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM customers"
        );

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch customers"
        });
    }
});

// Add customer
app.post("/api/customers", async (req, res) => {
    try {
        const { name, phone } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            phone === undefined ||
            phone === null
        ) {
            return res.status(400).json({
                message: "Please enter customer name and phone number"
            });
        }

        const cleanPhone = String(phone).trim();

        if (!/^\d{10}$/.test(cleanPhone)) {
            return res.status(400).json({
                message: "Phone number must contain exactly 10 digits"
            });
        }

        const [result] = await db.query(
            "INSERT INTO customers (name, phone) VALUES (?, ?)",
            [name.trim(), cleanPhone]
        );

        res.status(201).json({
            message: "Customer added successfully!",
            id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add customer"
        });
    }
});

// Update customer
app.put("/api/customers/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }

        if (
            typeof name !== "string" ||
            !name.trim() ||
            phone === undefined ||
            phone === null
        ) {
            return res.status(400).json({
                message: "Please enter customer name and phone number"
            });
        }

        const cleanPhone = String(phone).trim();

        if (!/^\d{10}$/.test(cleanPhone)) {
            return res.status(400).json({
                message: "Phone number must contain exactly 10 digits"
            });
        }

        const [result] = await db.query(
            "UPDATE customers SET name=?, phone=? WHERE id=?",
            [name.trim(), cleanPhone, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.json({
            message: "Customer updated successfully!"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update customer"
        });
    }
});

// Delete customer
app.delete("/api/customers/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }

        const [result] = await db.query(
            "DELETE FROM customers WHERE id=?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.json({
            message: "Customer deleted successfully!"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete customer"
        });
    }
});

// ==============================
// SALES
// ==============================

// Get all sales
app.get("/api/sales", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                id AS saleId,
                customer_name AS customer,
                product_name AS product,
                quantity,
                price,
                total,
                DATE_FORMAT(sale_date, '%d/%m/%Y') AS date
            FROM sales
            ORDER BY id DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch sales"
        });
    }
});

// Record sale and reduce product stock
app.post("/api/sales", async (req, res) => {
    const { customer, product, quantity } = req.body;

    if (
        typeof customer !== "string" ||
        !customer.trim() ||
        typeof product !== "string" ||
        !product.trim() ||
        quantity === "" ||
        quantity === undefined ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) <= 0
    ) {
        return res.status(400).json({
            message: "Invalid sale details"
        });
    }

    let connection;
    let transactionStarted = false;

    try {
        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // Check customer
        const [customers] = await connection.query(
            "SELECT id FROM customers WHERE name = ?",
            [customer.trim()]
        );

        if (customers.length === 0) {
            const error = new Error("Customer not found");
            error.statusCode = 404;
            throw error;
        }

        // Lock and check product stock
       const [products] = await connection.query(
    `SELECT id, name, quantity, price, min_stock
    FROM products
    WHERE name = ?
    FOR UPDATE`,
    [product.trim()]
);

        if (products.length === 0) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
        }

        const productRecord = products[0];
        const saleQuantity = Number(quantity);
        const previousQuantity = Number(productRecord.quantity);
const minimumStock = Number(productRecord.min_stock);
const newQuantity = previousQuantity - saleQuantity;
if (saleQuantity > previousQuantity) {
            const error = new Error("Insufficient stock");
            error.statusCode = 400;
            throw error;
        }

        const price = Number(productRecord.price);
        const total = price * saleQuantity;

        // Save sale
        await connection.query(
            `INSERT INTO sales
            (customer_name, product_name, quantity, price, total, sale_date)
            VALUES (?, ?, ?, ?, ?, CURDATE())`,
            [
                customer.trim(),
                product.trim(),
                saleQuantity,
                price,
                total
            ]
        );

        // Reduce stock
        await connection.query(
            "UPDATE products SET quantity = quantity - ? WHERE id = ?",
            [saleQuantity, productRecord.id]
        );
await connection.commit();
transactionStarted = false;

// Send email when stock becomes low
if (
    previousQuantity > minimumStock &&
    newQuantity <= minimumStock
) {
    await sendLowStockEmail({
        name: productRecord.name,
        quantity: newQuantity,
        min_stock: minimumStock
    });
}

res.status(201).json({
    message: "Sale recorded successfully!",
    total: total
});

    } catch (error) {
        if (connection && transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }

        console.error(error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to record sale"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// ==============================
// START SERVER
// ==============================

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

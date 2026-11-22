// Shared data for Inventory Management System

let products = JSON.parse(localStorage.getItem("products")) || [];
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];

  // Add missing sample products without deleting existing products

const sampleProducts = [
    {name:"Notebook",price:50,quantity:100,minStock:10},
    {name:"Pen",price:10,quantity:150,minStock:20},
    {name:"Pencil",price:5,quantity:200,minStock:20},
    {name:"Eraser",price:5,quantity:100,minStock:10},
    {name:"Sharpener",price:8,quantity:80,minStock:10},
    {name:"School Bag",price:450,quantity:30,minStock:5},
    {name:"Water Bottle",price:120,quantity:40,minStock:5},
    {name:"Geometry Box",price:100,quantity:35,minStock:5},
    {name:"Stapler",price:60,quantity:25,minStock:5},
    {name:"Marker",price:25,quantity:60,minStock:10},
    {name:"Highlighter",price:30,quantity:50,minStock:10},
    {name:"File Folder",price:35,quantity:45,minStock:5},
    {name:"Glue Stick",price:20,quantity:70,minStock:10},
    {name:"Scissors",price:40,quantity:30,minStock:5},
    {name:"Calculator",price:350,quantity:20,minStock:5},
    {name:"A4 Paper Pack",price:180,quantity:25,minStock:5},
    {name:"Crayons",price:90,quantity:40,minStock:5},
    {name:"Drawing Book",price:70,quantity:35,minStock:5},
    {name:"Sticky Notes",price:45,quantity:50,minStock:10},
    {name:"Ruler",price:15,quantity:90,minStock:10}
];

let productsChanged = false;

sampleProducts.forEach(sample => {

    const exists = products.some(
        product => product.name.toLowerCase() === sample.name.toLowerCase()
    );

    if (!exists) {
        products.push(sample);
        productsChanged = true;
    }
});

if (productsChanged) {
    saveData();
}
// Save data in browser storage
function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("customers", JSON.stringify(customers));
    localStorage.setItem("sales", JSON.stringify(sales));
}

// Check products with low stock
function getLowStockProducts() {
    return products.filter(
        product => Number(product.quantity) <= Number(product.minStock)
    );
}
// Add a new product
function addProduct(product) {
    products.push(product);
    saveData();
}

// Add a new customer
function addCustomer(customer) {
    customers.push(customer);
    saveData();
}

// Record a sale and update stock
function addSale(sale) {
    const product = products.find(
        p => p.name === sale.product
    );

    if (!product) {
        alert("Product not found!");
        return;
    }

    if (Number(product.quantity) < Number(sale.quantity)) {
        alert("Not enough stock available!");
        return;
    }

    product.quantity =
        Number(product.quantity) - Number(sale.quantity);

    sales.push(sale);
    saveData();
}

// Get all sales
function getSales() {
    return sales;
}
// Display sales records in Reports page
function displayReports() {
    const reportTable = document.getElementById("reportTable");

    if (!reportTable) return;

    reportTable.innerHTML = "";

    sales.forEach((sale, index) => {
        const row = reportTable.insertRow();

        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = sale.customer;
        row.insertCell().textContent = sale.product;
        row.insertCell().textContent = sale.quantity;
        row.insertCell().textContent = "₹" + sale.total;
        row.insertCell().textContent = sale.date;
    });
}

displayReports();
// Update Reports summary cards
function updateReportSummary() {
    const totalSales = sales.reduce(
        (sum, sale) => sum + Number(sale.total), 0
    );

    const totalTransactions = sales.length;

    const productsSold = sales.reduce(
        (sum, sale) => sum + Number(sale.quantity), 0
    );

    const salesElement = document.getElementById("totalSales");
    const transactionsElement = document.getElementById("totalTransactions");
    const productsElement = document.getElementById("productsSold");

    if (salesElement) {
        salesElement.textContent = "₹" + totalSales;
    }

    if (transactionsElement) {
        transactionsElement.textContent = totalTransactions;
    }

    if (productsElement) {
        productsElement.textContent = productsSold;
    }
}

updateReportSummary();
// ==================================
// SALES REPORT GENERATION
// ==================================

// Show or hide custom date selection
const reportPeriod = document.getElementById("reportPeriod");
const customDates = document.getElementById("customDates");

if (reportPeriod && customDates) {
    reportPeriod.addEventListener("change", function () {
        customDates.style.display =
            this.value === "custom" ? "block" : "none";
    });
}
// Convert stored sale date into a valid Date
function getSaleDate(dateValue) {
    if (!dateValue) return null;

    const parts = String(dateValue).match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

    if (parts) {
        let first = Number(parts[1]);
        let second = Number(parts[2]);
        let year = Number(parts[3]);

        let month, day;

        if (second > 12) {
            // MM/DD/YYYY
            month = first;
            day = second;
        } else if (first > 12) {
            // DD/MM/YYYY
            day = first;
            month = second;
        } else {
            // Default to MM/DD/YYYY
            month = first;
            day = second;
        }

        const date = new Date(year, month - 1, day);

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) return null;

        return date;
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return null;

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}

// Generate the selected sales report
let salesChart = null;
let productChart = null;
let areaChart = null;

function generateSalesReport() {

    const period = document.getElementById("reportPeriod");

    if (!period) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate = new Date(today);
    let endDate = new Date(today);

    if (period.value === "week") {
        startDate.setDate(today.getDate() - 6);
    }

    else if (period.value === "month") {
        startDate.setMonth(today.getMonth() - 1);
    }

    else if (period.value === "custom") {

        const start = document.getElementById("startDate").value;
        const end = document.getElementById("endDate").value;

        if (!start || !end) {
            alert("Please select both start and end dates.");
            return;
        }

        startDate = new Date(start + "T00:00:00");
        endDate = new Date(end + "T00:00:00");

        if (startDate > endDate || endDate > today) {
            alert("Please select a valid date range.");
            return;
        }
    }

    // Filter sales according to selected dates
    const filteredSales = sales.filter(sale => {
        const saleDate = getSaleDate(sale.date);

        return saleDate &&
            saleDate >= startDate &&
            saleDate <= endDate;
    });

    // Calculate report values
    const revenue = filteredSales.reduce(
        (sum, sale) => sum + Number(sale.total || 0), 0
    );

    const transactions = filteredSales.length;

    const quantitySold = filteredSales.reduce(
        (sum, sale) => sum + Number(sale.quantity || 0), 0
    );

    // Update summary cards
    document.getElementById("totalSales").textContent =
        "₹" + revenue.toFixed(2);

    document.getElementById("totalTransactions").textContent =
        transactions;

    document.getElementById("productsSold").textContent =
        quantitySold;

    // Update sales history table
    const table = document.getElementById("reportTable");

    if (table) {
        table.innerHTML = "";

        filteredSales.forEach((sale, index) => {
            const row = table.insertRow();
row.insertCell().textContent = sale.saleId;
            row.insertCell().textContent = sale.customer;
            row.insertCell().textContent = sale.product;
            row.insertCell().textContent = sale.quantity;
            row.insertCell().textContent =
                "₹" + Number(sale.total || 0).toFixed(2);
            row.insertCell().textContent = sale.date;
        });
    }

    // Calculate product-wise sales
    const productTotals = {};

    filteredSales.forEach(sale => {
        productTotals[sale.product] =
            (productTotals[sale.product] || 0) +
            Number(sale.quantity || 0);
    });

    const bestProduct = Object.entries(productTotals)
        .sort((a, b) => b[1] - a[1])[0];

    // Generate written summary
    const summary = document.getElementById("salesSummary");

    if (summary) {
        if (filteredSales.length === 0) {
            summary.textContent =
                "No sales transactions were recorded during this period.";
        } else {
            summary.textContent =
                `During this period, the business recorded ${transactions} ` +
                `transactions and earned ₹${revenue.toFixed(2)} in total revenue. ` +
                `${quantitySold} products were sold. The best-selling product ` +
                `was ${bestProduct[0]}, with ${bestProduct[1]} units sold.`;
        }
    }

    // Prepare graph data by date
    const dailySales = {};

    filteredSales.forEach(sale => {
        const date = getSaleDate(sale.date);

        const key =
            date.getFullYear() + "-" +
            String(date.getMonth() + 1).padStart(2, "0") + "-" +
            String(date.getDate()).padStart(2, "0");

        dailySales[key] =
            (dailySales[key] || 0) + Number(sale.total || 0);
    });

    const labels = Object.keys(dailySales).sort();

    const values = labels.map(date => dailySales[date]);

   // ==================================
// DRAW ALL THREE SALES GRAPHS
// ==================================

if (typeof Chart !== "undefined") {

   // 1. DAILY SALES BAR GRAPH

const salesCanvas = document.getElementById("salesChart");

if (salesCanvas) {

    if (salesChart) {
        salesChart.destroy();
    }

    salesChart = new Chart(salesCanvas, {
        type: "bar",

        data: {
            labels: labels,
            datasets: [{
                label: "Daily Sales (₹)",
                data: values,
                backgroundColor: "#C77DFF",
                borderColor: "#7B2CBF",
                borderWidth: 2,
                borderRadius: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
    beginAtZero: true,

    ticks: {
        stepSize: 100
    },

    title: {
        display: true,
        text: "Revenue (₹)"
    }
},
                x: {
                    title: {
                        display: true,
                        text: "Date"
                    }
                }
            }
        }
    });
}
// 2. PRODUCT-WISE DOUGHNUT GRAPH

const productCanvas = document.getElementById("productChart");

if (productCanvas) {

    if (productChart) {
        productChart.destroy();
    }

    const productLabels = Object.keys(productTotals);
    const productValues = Object.values(productTotals);

    productChart = new Chart(productCanvas, {
        type: "doughnut",

        data: {
            labels: productLabels,

            datasets: [{
                label: "Products Sold",
                data: productValues,

                backgroundColor: [
                    "#7B2CBF",
                    "#9D4EDD",
                    "#C77DFF",
                    "#E0AAFF",
                    "#B8A1E3",
                    "#6A4C93"
                ],

                borderWidth: 2,
                borderColor: "#FFFFFF"
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: true,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

} // End of Chart condition

} // End of generateSalesReport function


// Load sales directly from MySQL
async function loadSalesFromDatabase() {
    if (!document.getElementById("reportPeriod")) return;

    try {
        const response = await fetch("/api/sales");

        if (!response.ok) {
            throw new Error("Failed to load sales");
        }

        sales = await response.json();

        generateSalesReport();

    } catch (error) {
        console.error(error);
        alert("Could not load reports from database.");
    }
}

// Display reports when the page opens
loadSalesFromDatabase();

// Refresh reports when returning to the Reports page
window.addEventListener("focus", function() {
    loadSalesFromDatabase();
});

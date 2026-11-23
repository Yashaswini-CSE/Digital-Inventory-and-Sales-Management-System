# Digital Inventory and Sales Management System

## Project Overview

The Digital Inventory and Sales Management System is a web-based application designed to help small businesses manage products, inventory, customers and sales digitally.

It reduces manual work, maintains stock records and helps business owners monitor sales and low-stock products.

## Objectives

- Manage product details and stock quantities.
- Maintain customer information.
- Record sales transactions.
- Automatically update stock after sales.
- Identify products with low stock.
- Send email notifications for low-stock products.
- Generate sales reports and charts.

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL
- MySQL Workbench

### Additional Tools
- Chart.js
- Nodemailer
- Visual Studio Code
- Git and GitHub

## Main Modules

1. Dashboard
2. Product Management
3. Customer Management
4. Sales Management
5. Stock Notifications
6. Reports and Analytics
7. Email Notifications

## Key Features

- Add, edit and delete products.
- Manage customer records.
- Select registered customers while recording sales.
- Automatically reduce product stock after a sale.
- Display low-stock notifications.
- Send low-stock email alerts.
- View sales summaries and graphical reports.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Yashaswini-Gowda08/Digital-Inventory-and-Sales-Management-System.git

cd Digital-Inventory-and-Sales-Management-System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root directory using `.env.example` as a reference.

Update the database and email configuration with your own credentials.

**Note:** Never upload your `.env` file or share your passwords publicly.

### 4. Configure the Database

- Open MySQL Workbench.
- Create the database named `inventory_db`.
- Execute the SQL commands from `database.sql`.

### 5. Start the Application

```bash
npm start
```

### 6. Open the Application

Visit the following URL in your browser:

```text
http://localhost:3000
```

## Project Structure

```text
Digital-Inventory-and-Sales-Management-System/
│
├── public/
│   ├── images/
│   ├── index.html
│   ├── products.html
│   ├── customers.html
│   ├── sales.html
│   ├── notifications.html
│   ├── reports.html
│   ├── script.js
│   └── style.css
│
├── server.js
├── db.js
├── database.sql
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Future Enhancements

- SMS and WhatsApp stock alerts.
- Improved user authentication.
- Additional sales analytics.

## Developed As

A Project-Based Learning (PBL) project.

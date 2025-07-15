import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";



export const setIncomeExpenseDetails = async (req, res, next) => {
    const { type, category, date, amount, paymentMethod, payee, payer, description, receipt } = req.body;
    const receiptBuffer = req.file?.buffer || null;

    try {
        if(type == 'income'){
            const [rows] = await pool.query('INSERT INTO Income (Date, Category, Amount, Payment_method, Payer,Description, Invoice_image) VALUES (?, ?, ?, ?, ?, ?, ?)', [date, category, amount, paymentMethod, payer, description, receiptBuffer]);
            if (rows.affectedRows === 0) {
                return next(errorHandler(404, 'No income details added'));
            }

        }
        else if(type == 'expense'){
            const [rows] = await pool.query('INSERT INTO expenses (Date, Category, Amount, Payment_method, Payee,Description, Receipt_image) VALUES (?, ?, ?, ?, ?, ?, ?)', [date, category, amount, paymentMethod, payee, description, receiptBuffer]);
            if (rows.affectedRows === 0) {
                return next(errorHandler(404, 'No expense details added'));
            }
        }
        res.status(200).json({ message: "Income/Expense details added successfully" });
    } catch (error) {
        next(error);
    }
}

export const getIncomeExpenseDetails = async (req, res, next) => {
    try {
        const [incomeRows] = await pool.query("SELECT Income_id, Date, Category, Amount, Payment_method, Payer, Description FROM Income");
        const [expenseRows] = await pool.query('SELECT Expense_id, Date, Category, Amount, Payment_method, Payee, Description FROM expenses');
        
        const income = incomeRows.map(row => ({
            ...row,
            Date: row.Date.toISOString().split('T')[0],
            type: "income" 
        }));
        const expenses = expenseRows.map(row => ({
            ...row,
            Date: row.Date.toISOString().split('T')[0],
            type: "expense" 
        }));
        const allDetails = [...income, ...expenses];
        res.status(200).json({
            allDetails
        });
    } catch (error) {
        next(error);
    }
}

export const getIncomeExpenseDetailsForYear = async (req, res, next) => {
    try {
        const { year } = req.body;
        if (!year) {
            return next(errorHandler(400, 'Year is required'));
        }

        const [incomeRows] = await pool.query('SELECT MONTH(Date) AS month, SUM(Amount) AS total_income FROM income WHERE YEAR(Date) = ? GROUP BY MONTH(Date) ORDER BY MONTH(Date)', [year]);
        const [expenseRows] = await pool.query('SELECT MONTH(Date) AS month, SUM(Amount) AS total_expense FROM expenses WHERE YEAR(Date) = ? GROUP BY MONTH(Date) ORDER BY MONTH(Date)', [year]);
        
        const income = incomeRows.map(row => ({
            ...row,
            type: "income", 
            month: row.month === 1 ? "January" : row.month === 2 ? "February" :
            row.month === 3 ? "March" : row.month === 4 ? "April" :
            row.month === 5 ? "May" : row.month === 6 ? "June" :
            row.month === 7 ? "July" : row.month === 8 ? "August" :
            row.month === 9 ? "September" : row.month === 10 ? "October":
            row.month === 11 ? "November" : "December"        
        }));
        const expenses = expenseRows.map(row => ({
            ...row,
            type: "expense",
            month: row.month === 1 ? "January" : row.month === 2 ? "February" :
            row.month === 3 ? "March" : row.month === 4 ? "April" :
            row.month === 5 ? "May" : row.month === 6 ? "June" :
            row.month === 7 ? "July" : row.month === 8 ? "August" :
            row.month === 9 ? "September" : row.month === 10 ? "October":
            row.month === 11 ? "November" : "December" 
        }));
        const allDetails = [...income, ...expenses];
        res.status(200).json({
            allDetails
        });

    } catch (error) {
        next(error);
    }
}

export const getMonthlyDataForReporting = async (req, res, next) => {
    try {
        const { month, year } = req.body;
        if (!month || !year) {
            return next(errorHandler(400, 'Month and Year are required'));
        }

        const [incomeRows] = await pool.query("SELECT Income_id, Date, Category, Amount, Payment_method, Payer, Description FROM income WHERE YEAR(Date) = ? AND Month(Date) = ?", [year, month]);
        const [expenseRows] = await pool.query("SELECT Expense_id, Date, Category, Amount, Payment_method, Payee, Description FROM expenses WHERE YEAR(Date) = ? AND Month(Date) = ?", [year, month]);
        if (incomeRows.length === 0 && expenseRows.length === 0) {
            return next(errorHandler(404, 'No income or expense details found for the specified month'))

        }

        const income = incomeRows.map(row => ({
            ...row,
            Date: row.Date.toISOString().split('T')[0],
            type: "income" 
        }));
        const expenses = expenseRows.map(row => ({
            ...row,
            Date: row.Date.toISOString().split('T')[0],
            type: "expense" 
        }));
        const allDetails = [...income, ...expenses];
        res.status(200).json({
            allDetails
        });
    } catch (error) {
        next(error);
    }
}   




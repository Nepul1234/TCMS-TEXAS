import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getLoanRequests = async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT slr.id, slr.staff_id, slr.amount, slr.monthly_deduction, slr.purpose, slr.status, slr.repayment_date, slr.type, slr.description, slr.request_date, CONCAT(s.fname,' ',s.lname) AS staff_name FROM staff_loan_requests slr JOIN teacher s ON slr.staff_id = s.teacher_id ORDER BY slr.request_date DESC");
        if (rows.length === 0) {
            return next(errorHandler(404, 'No loan requests found'));
        }
        res.status(200).json({ loanRequests: rows });
    } catch (error) {
        next(error);
    }
}

export const getAllLoanStaffDetails = async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT teacher_id AS id, CONCAT(fname,' ',lname) AS name FROM teacher");
        if (rows.length === 0) {
            return next(errorHandler(404, 'No staff details found'));
        }
        res.status(200).json({ staffDetails: rows });
    } catch (error) {
        next(error);
    }
}

export const setLoanRequest = async (req, res, next) => {
    const { id,staffId, amount, purpose,requestDate, type, status, repaymentDate, monthlyDeduction, notes } = req.body;
    try {
        if(!id) {
            const [rows] = await pool.query("INSERT INTO staff_loan_requests (staff_id, amount, purpose, request_date, type, status, repayment_date, monthly_deduction, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [staffId, amount, purpose, requestDate,type,status, repaymentDate, monthlyDeduction, notes]);
        if (rows.affectedRows === 0) {
            return next(errorHandler(500, 'Failed to create loan request'));
        }
        return res.status(201).json({ message: 'Loan request created successfully' });
        }
        else{
            const [existingRequest] = await pool.query("SELECT * FROM staff_loan_requests WHERE id = ?", [id]);
           if(id === existingRequest[0]?.id) {
              const rows = await pool.query("UPDATE staff_loan_requests SET staff_id = ?, amount = ?, purpose = ?, request_date = ?, type = ?, status = ?, repayment_date = ?, monthly_deduction = ?, description = ? WHERE id = ?", [staffId, amount, purpose, requestDate, type, status, repaymentDate, monthlyDeduction, notes, id]);
              if (rows.affectedRows === 0) {
                 return next(errorHandler(500, 'Failed to update loan request'));
             }
             return res.status(200).json({ message: 'Loan request updated successfully' });
        }
        }
        
        
        
    } catch (error) {
        next(error);
    }
}

export const deleteLoanRequest = async (req, res, next) => {
    const { id } = req.body;
    try {
        const [rows] = await pool.query("DELETE FROM staff_loan_requests WHERE id = ?", [id]);
        if (rows.affectedRows === 0) {
            return next(errorHandler(404, 'Loan request not found'));
        }
        res.status(200).json({ message: 'Loan request deleted successfully' });
    } catch (error) {
        next(error);
    }
}
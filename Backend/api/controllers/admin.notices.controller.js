import pool from '../utils/dbconn.js';
import errorHandler from '../utils/error.js';

export const getSuperAdminNotices = async (req, res, next) => {
    try {
        const [notices] = await pool.query('SELECT * FROM super_admin_notices ORDER BY date DESC');
        if (notices.length === 0) {
            return next(errorHandler(404, 'No notices found'));
        }
        res.status(200).json({ notices:notices });
    } catch (error) {
        next(error);
    }
}

export const createSuperAdminNotice = async (req, res, next) => {
    const { title,author, category, content, date, priority } = req.body;
    try {
      const [existingNotice] = await pool.query('SELECT * FROM super_admin_notices WHERE topic = ?', [title]);
        if (existingNotice.length > 0) {
            return next(errorHandler(400, 'Notice with this title already exists'));
        }
        const [rows] = await pool.query('INSERT INTO super_admin_notices (topic, description, category, date, priority, author ) VALUES (?, ?, ?, ?, ?, ?)', [title, content, category, date, priority, author]);
        if (rows.affectedRows === 0) {
            return next(errorHandler(500, 'Failed to create notice'));
        }
        res.status(201).json({ message: 'Notice created successfully' });
    } catch (error) {
        next(error);
    }
}
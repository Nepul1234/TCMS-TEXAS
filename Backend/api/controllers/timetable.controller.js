import pool from "../utils/dbconn.js";
import errorHandler from "../utils/error.js";

export const getTimetable = async (req, res, next) => {
    try {
        const [timetable] = await pool.query(`SELECT * FROM timetable`);
        if (timetable.length === 0) {
            return next(errorHandler(404, 'No timetable found'));
        }
        res.status(200).json({timetable});
        
    } catch (error) {
        next(error);
    }
}

export const setTimeTable = async (req, res, next) => {
    const { title,grade,content} = req.body;
    try {
        // Check if the timetable already exists
        const [existingTimetable] = await pool.query('SELECT * FROM timetable WHERE title = ? AND grade = ?', [title, grade]);
        if (existingTimetable.length > 0) {
            return next(errorHandler(400, 'Timetable already exists'));
        }

        // Insert the new timetable into the database
        await pool.query('INSERT INTO timetable (title, grade, content) VALUES (?, ?, ?)', [title, grade, content]);
        res.status(201).json({ message: 'Timetable created successfully' });
        
    } catch (error) {
        next(error);
    }
};

export const updateTimeTable = async (req, res, next) => {
    const { timeTableId } = req.params;
    const { title, grade, content } = req.body;

    try {
        // Check if the timetable exists
        const [existingTimetable] = await pool.query('SELECT * FROM timetable WHERE id = ?', [timeTableId]);
        if (existingTimetable.length === 0) {
            return next(errorHandler(404, 'Timetable not found'));
        }

        // Update the timetable in the database
        await pool.query('UPDATE timetable SET title = ?, grade = ?, content = ? WHERE id = ?', [title, grade, content, timeTableId]);
        res.status(200).json({ message: 'Timetable updated successfully' });
        
    } catch (error) {
        next(error);
    }
}

export const deleteTimetable = async(req, res, next) => {
    const { id } = req.params;
    try{
        const [existingTimetable] = await pool.query("SELECT * FROM timetable WHERE id = ?",[id]);
        if (existingTimetable.length === 0) 
            return next(errorHandler(404, 'Timetable not found'));
        await pool.query('DELETE FROM timetable WHERE id = ?',[id]);
        res.status(200).json("Timetable deleted successfully");
    }
    catch(error){
        next(error)
    }

    


}

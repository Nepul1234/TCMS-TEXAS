import errorHandler from "../utils/error.js";
import pool from "../utils/dbconn.js";

export const getAllStudentMarks = async (req, res) => {
    try {
        const [studentMarks] = await pool.query("SELECT * FROM student_marks");
        res.status(200).json(studentMarks);
    } catch (error) {
        errorHandler(error, res);
    }
};


// Update student marks (with value structure only, no validation)
export const updateStudentMarks = async (req, res) => {
  const { id: markId } = req.params;
  const updateFields = req.body;

  if (!markId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Mark ID is required' 
    });
  }

  const allowedFields = [
    'first_test_marks',
    'second_test_marks', 
    'third_test_marks',
    'assignment_marks',
    'quiz_marks'
  ];

  const fieldsToUpdate = {};
  Object.keys(updateFields).forEach(key => {
    if (allowedFields.includes(key)) {
      fieldsToUpdate[key] = updateFields[key];
    }
  });

  if (Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'No valid fields to update' 
    });
  }

  const setClause = Object.keys(fieldsToUpdate)
    .map(field => `${field} = ?`)
    .join(', ');

  const values = Object.values(fieldsToUpdate);
  values.push(markId);

  const query = `UPDATE student_marks SET ${setClause} WHERE mark_id = ?`;

  try {
    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student mark record not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student marks updated successfully',
      data: {
        markId,
        updatedFields: fieldsToUpdate,
        affectedRows: result.affectedRows
      }
    });
  } catch (error) {
    errorHandler(error, res);
  }
  console.log("Update student marks endpoint hit with data:", updateFields);
  console.log("Mark ID:", markId);
};





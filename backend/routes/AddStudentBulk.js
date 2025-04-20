const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const DataModelStudent = require('../models/Student');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// ✅ Corrected: Use router.post() instead of app.post()
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
  }

  const filePath = req.file.path;

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Process each row
    const processedData = data.map(row => {
      // Parse extraFees
      if (row.extraFees) {
        row.extraFees = row.extraFees.split(';').map(fee => {
          const [name, amount] = fee.split(':');
          return { name: name.trim(), amount: Number(amount) };
        });
      }

      // Parse installments
      if (row.installments) {
        row.installments = row.installments.split(';').map(installment => {
          const [installmentNo, amount, dueDate] = installment.split(':');
          return {
            installmentNo: Number(installmentNo),
            amount: Number(amount),
            dueDate: new Date(dueDate.trim())
          };
        });
      }

      return row;
    });

    // Insert data into MongoDB
    await DataModelStudent.insertMany(processedData);

    // Delete the file after processing
    fs.unlinkSync(filePath);

    res.status(200).json({ success: true, message: "File imported successfully!" });
  } catch (err) {
    console.error(err);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ success: false, message: "Error importing file.", error: err.message });
  }
});

// Export the router
module.exports = router;
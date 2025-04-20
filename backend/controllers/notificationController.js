const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { sendNotification } = require('../services/notificationServices');

// Check for upcoming installments and create notifications
exports.checkInstallments = async () => {
  try {
    const daysBeforeNotification = 3; // Notify 3 days before due date
    const today = new Date();
    
    const students = await Student.aggregate([
      { $unwind: '$installments' },
      {
        $match: {
          'installments.dueDate': {
            $gte: new Date(today.setDate(today.getDate() + daysBeforeNotification)),
            $lt: new Date(today.setDate(today.getDate() + daysBeforeNotification + 1))
          }
        }
      },
      {
        $project: {
          _id: 1,
          studentName: 1,
          email: 1,
          phone: 1,
          installment: '$installments'
        }
      }
    ]);

    const notifications = await Promise.all(
      students.map(async (student) => {
        // Check if notification already exists
        const exists = await Notification.findOne({
          student: student._id,
          dueDate: student.installment.dueDate
        });

        if (!exists) {
          const message = `Reminder: Payment of ₹${student.installment.amount} for ${student.studentName} is due on ${student.installment.dueDate.toDateString()}`;
          
          return Notification.create({
            student: student._id,
            message,
            dueDate: student.installment.dueDate
          });
        }
        return null;
      })
    );

    // Filter out null values and send notifications
    const validNotifications = notifications.filter(n => n !== null);
    await sendNotifications(validNotifications);

    console.log(`Processed ${validNotifications.length} notifications`);
    return validNotifications;

  } catch (error) {
    console.error('Error checking installments:', error);
    throw error;
  }
};

// Send notifications via email/SMS
const sendNotifications = async (notifications) => {
  for (const notification of notifications) {
    try {
      const student = await Student.findById(notification.student);
      
      // Send email
      await sendNotification({
        email: student.email,
        phone: student.phone,
        message: notification.message
      });

      // Update notification status
      notification.status = 'sent';
      notification.isSent = true;
      await notification.save();
      
    } catch (error) {
      console.error(`Failed to send notification for student ${notification.student}:`, error);
      notification.status = 'failed';
      await notification.save();
    }
  }
};
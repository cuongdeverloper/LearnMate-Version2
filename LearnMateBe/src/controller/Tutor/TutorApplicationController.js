const TutorApplication = require('../../modal/TutorApplication');
const User = require('../../modal/User');
const Tutor = require('../../modal/Tutor')
const uploadCloud = require('../../config/cloudinaryConfig');
const { createTutorApplicationNotification } = require('../Notification/NotificationController');

  const submitApplication = async (req, res) => {
    try {
      
      const {
        experience,
        education,
        subjects,
        bio,
        pricePerHour,
        location,
        languages,
        certificates
      } = req.body;

      const tutorId = req.user?.id; // Đây là userId
      const cvFile = req.file?.path;


      if (!tutorId) {
        return res.status(401).json({
          errorCode: 1,
          message: 'Không xác định được người dùng.'
        });
      }
      // --- KIỂM TRA NẾU ĐÃ LÀ TUTOR ---
      // const existingTutor = await Tutor.findOne({ user: tutorId });
      // if (existingTutor) {
      //   return res.status(400).json({
      //     errorCode: 4,
      //     message: 'Bạn đã là gia sư, không thể nộp đơn đăng ký mới.'
      //   });
      // }

      // --- PARSE FIELDS ---
      let parsedSubjects = subjects;
      try {
        if (typeof parsedSubjects === 'string') {
          parsedSubjects = JSON.parse(parsedSubjects);
        }
      } catch {
        parsedSubjects = [subjects];
      }
      if (!Array.isArray(parsedSubjects)) {
        parsedSubjects = [parsedSubjects].filter(Boolean);
      }

      const cleanArray = (val) => {
        if (Array.isArray(val)) return val.filter(v => v && v.trim() !== '');
        if (typeof val === 'string') {
          return val.split(',').map(v => v.trim()).filter(Boolean);
        }
        return [];
      };

      const parsedLanguages = cleanArray(languages);
      const parsedCertificates = cleanArray(certificates);

      // --- VALIDATION ---
      const missingFields = [];
      if (!cvFile) missingFields.push('CV');
      if (!experience?.trim()) missingFields.push('Kinh nghiệm');
      if (!education?.trim()) missingFields.push('Học vấn');
      if (!bio?.trim()) missingFields.push('Giới thiệu bản thân');
      if (!location?.trim()) missingFields.push('Địa điểm');
      if (!pricePerHour || isNaN(pricePerHour) || Number(pricePerHour) <= 0)
        missingFields.push('Giá mỗi giờ');
      if (!parsedSubjects || parsedSubjects.length === 0)
        missingFields.push('Môn học');

      if (missingFields.length > 0) {
        return res.status(400).json({
          errorCode: 2,
          message: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`
        });
      }

      // --- KIỂM TRA ĐƠN PENDING ---
      const existingApp = await TutorApplication.findOne({
        tutorId,
        status: 'pending'
      });
      if (existingApp) {
        return res.status(400).json({
          errorCode: 3,
          message: 'Bạn đã có đơn đăng ký đang chờ duyệt.'
        });
      }

      // --- TẠO MỚI ĐƠN ĐĂNG KÝ ---
      const newApplication = new TutorApplication({
        tutorId,
        cvFile,
        certificates: parsedCertificates,
        experience: experience.trim(),
        education: education.trim(),
        subjects: parsedSubjects,
        bio: bio.trim(),
        pricePerHour: Number(pricePerHour),
        location: location.trim(),
        languages: parsedLanguages,
        status: 'pending'
      });

      await newApplication.save();

      // --- GỬI THÔNG BÁO CHO ADMIN ---
      try {
        if (typeof createTutorApplicationNotification === 'function') {
          await createTutorApplicationNotification(newApplication);
        } else {
          console.log('createTutorApplicationNotification function not available');
        }
      } catch (notificationError) {
        console.error('Notification error (non-critical):', notificationError);
        // Don't fail the application submission if notification fails
      }

      return res.status(201).json({
        errorCode: 0,
        message: ' Đơn đăng ký gia sư của bạn đã được gửi thành công. Vui lòng chờ duyệt!',
        data: newApplication
      });

    } catch (error) {
      console.error(' Lỗi khi submit application:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return res.status(500).json({
        errorCode: 500,
        message: 'Lỗi server khi xử lý đơn đăng ký',
        details: error.message
      });
    }
  };

// Get all applications (for admin)
const getAllApplications = async (req, res) => {
  try {
    const applications = await TutorApplication.find({})
      .populate('tutorId', 'username email phoneNumber image')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      errorCode: 0,
      message: 'Applications retrieved successfully',
      data: applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      errorCode: 1,
      message: 'Error retrieving applications'
    });
  }
};

// Get applications by status
const getApplicationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        errorCode: 1,
        message: 'Invalid status'
      });
    }

    const applications = await TutorApplication.find({ status })
      .populate('tutorId', 'username email phoneNumber image')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      errorCode: 0,
      message: 'Applications retrieved successfully',
      data: applications
    });
  } catch (error) {
    console.error('Get applications by status error:', error);
    res.status(500).json({
      errorCode: 2,
      message: 'Error retrieving applications'
    });
  }
};

// Approve application
const approveApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const adminId = req.user.id;

    const application = await TutorApplication.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({
        errorCode: 1,
        message: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        errorCode: 2,
        message: 'Application has already been processed'
      });
    }

    application.status = 'approved';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();

    await application.save();

    // Update user verified status - cho phép verify bất kỳ user nào
    await User.findByIdAndUpdate(application.tutorId, {
      verified: true,
      role: 'tutor'
    });

    res.status(200).json({
      errorCode: 0,
      message: 'Application approved successfully',
      data: application
    });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({
      errorCode: 3,
      message: 'Error approving application'
    });
  }
};

// Reject application
const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    if (!rejectionReason) {
      return res.status(400).json({
        errorCode: 1,
        message: 'Rejection reason is required'
      });
    }

    const application = await TutorApplication.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({
        errorCode: 2,
        message: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        errorCode: 3,
        message: 'Application has already been processed'
      });
    }

    application.status = 'rejected';
    application.rejectionReason = rejectionReason;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();

    await application.save();

    res.status(200).json({
      errorCode: 0,
      message: 'Application rejected successfully',
      data: application
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({
      errorCode: 4,
      message: 'Error rejecting application'
    });
  }
};

// Get application by ID
const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await TutorApplication.findById(applicationId)
      .populate('tutorId', 'username email phoneNumber image')
      .populate('reviewedBy', 'username');

    if (!application) {
      return res.status(404).json({
        errorCode: 1,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      errorCode: 0,
      message: 'Application retrieved successfully',
      data: application
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      errorCode: 2,
      message: 'Error retrieving application'
    });
  }
};

// Get tutor's own applications
const getTutorApplications = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const applications = await TutorApplication.find({ tutorId })
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      errorCode: 0,
      message: 'Applications retrieved successfully',
      data: applications
    });
  } catch (error) {
    console.error('Get tutor applications error:', error);
    res.status(500).json({
      errorCode: 1,
      message: 'Error retrieving applications'
    });
  }
};

module.exports = {
  submitApplication,
  getAllApplications,
  getApplicationsByStatus,
  approveApplication,
  rejectApplication,
  getApplicationById,
  getTutorApplications
}; 
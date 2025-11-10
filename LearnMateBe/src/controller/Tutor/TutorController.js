const Booking = require("../../modal/Booking");
const Schedule = require("../../modal/Schedule");
const Material = require("../../modal/Material");
const Progress = require("../../modal/Progress");
const TutorAvailability = require("../../modal/TutorAvailability");
const Tutor = require("../../modal/Tutor");
const User = require("../../modal/User");
const mapMimeToType = (mime) => {
  if (!mime) return 'other';
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('word') || mime.includes('doc')) return 'document';
  if (mime.includes('sheet') || mime.includes('excel')) return 'document';
  if (mime.includes('image')) return 'image';
  if (mime.includes('video')) return 'video';
  return 'other';
};
const respondBooking = async (req, res) => {
  try {
    const { bookingId, action, learnerId } = req.body;
    const validActions = ["approve", "rejected", "cancelled"];
    if (!validActions.includes(action))
      return res.status(400).json({ message: "Invalid action" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Lấy tutorId để check lịch
    const tutorId = booking.tutorId;

    // 🔹 Nếu tutor muốn approve → kiểm tra trùng lịch
    if (action === "approve") {
      // Lấy tất cả schedule của booking này
      const bookingSchedules = await Schedule.find({ bookingId });

      for (const sch of bookingSchedules) {
        const conflict = await Schedule.findOne({
          tutorId,
          date: sch.date,
          status: "approved", // chỉ check lịch đã approved
          $or: [
            {
              $and: [
                { startTime: { $lt: sch.endTime } },
                { endTime: { $gt: sch.startTime } },
              ],
            },
          ],
        });

        if (conflict) {
          return res.status(400).json({
            message:
              "Tutor already has an approved schedule during this time. Cannot approve this booking.",
          });
        }
      }
    }

    // Cập nhật learnerId nếu có
    if (learnerId) booking.learnerId = learnerId;

    // Cập nhật trạng thái booking
    booking.status = action;
    await booking.save();

    // 🔹 Nếu approve thì update tất cả Schedule liên quan
    if (action === "approve") {
      await Schedule.updateMany({ bookingId }, { $set: { status: "approved" } });
    }

    // 🔹 Nếu reject hoặc cancel, xoá schedule
    if (action === "rejected" || action === "cancelled") {
      await Schedule.deleteMany({ bookingId });
    }

    let msg = "";
    switch (action) {
      case "approve":
        msg = "Booking has been approved ✅ (All schedules set to approved)";
        break;
      case "rejected":
        msg = "Booking has been rejected ❌ (Schedules removed)";
        break;
      case "cancelled":
        msg = "Booking has been cancelled 🛑 (Schedules removed)";
        break;
    }

    return res.status(200).json({ message: msg, booking });
  } catch (error) {
    console.error("respondBooking Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// 👌 Cancel Booking by learner
const cancelBooking = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    if (!bookingId || !reason) {
      return res.status(400).json({ message: "bookingId and reason are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Kiểm tra nếu chưa có scheduleIds thì không cho hủy
    if (!booking.scheduleIds || booking.scheduleIds.length === 0) {
      return res.status(400).json({ message: "Cannot cancel booking without schedules" });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason;
    await booking.save();

    return res.status(200).json({
      message: "Booking has been cancelled 🛑",
      booking,
    });
  } catch (error) {
    console.error("cancelBooking Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 👌 Get pending bookings for a tutor
const getPendingBookings = async (req, res) => {
  try {
    const tutorUserId = req.params.tutorId;
    const user = await User.findById(tutorUserId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const tutor = await Tutor.findOne({ user: user._id });
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    const bookings = await Booking.find({
      tutorId: tutor._id,
      status: "pending",
    }).populate("learnerId", "username email")
      .populate("subjectId","name classLevel")
      .populate({
    path: "scheduleIds",
    select: "date startTime endTime attended",
    options: { sort: { date: 1, startTime: 1 } } 
  });
    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("getPendingBookings Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create schedule
const createSchedule = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // B1: Kiểm tra booking tồn tại
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // B2: Đếm số buổi đã tạo trong Schedule
    const existingSessions = await Schedule.countDocuments({ bookingId });

    // B3: So sánh với số buổi đã đặt
    if (existingSessions >= booking.numberOfSessions) {
      return res.status(400).json({
        message: "Number of scheduled sessions exceeds booking limit",
      });
    }

    // B4: Tạo buổi học mới
    const slot = new Schedule(req.body);
    await slot.save();

    // B5: Lưu lại ID buổi học vào booking.scheduleIds (optional, nếu dùng field này)
    booking.scheduleIds.push(slot._id);
    await booking.save();

    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSchedule = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor không tồn tại." });
    }

    // Chỉ lấy các lịch đã được approve
    const schedules = await Schedule.find({ tutorId: tutor._id, status: "approved" })
      .populate({
        path: "learnerId",
        select: "username email phoneNumber",
      })
      .populate({
        path: "bookingId",
        select: "address status subjectId",
        populate: {
          path: "subjectId",
          select: "name",
        },
      })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, data: schedules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


const updateSchedule = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete schedule
const deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update progress
const updateProgress = async (req, res) => {
  try {
    const progress = new Progress(req.body);
    await progress.save();
    res.status(201).json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get progress by student
const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.params.studentId });
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadMaterial = async (req, res) => {
  try {
    const { bookingId, title, description } = req.body;
    const fileUrl = req.file?.path || req.file?.secure_url;

    if (!bookingId || !title || !fileUrl) {
      return res.status(400).json({
        errorCode: 1,
        message: "bookingId, title và fileUrl là bắt buộc.",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("subjectId", "_id name")
      .populate("tutorId", "_id")
      .populate("learnerId", "_id");

    if (!booking) {
      return res.status(404).json({
        errorCode: 1,
        message: "Không tìm thấy booking tương ứng.",
      });
    }

    const fileType = mapMimeToType(req.file?.mimetype);

    const newMaterial = new Material({
      bookingId,
      subjectId: booking.subjectId?._id,
      tutorId: booking.tutorId?._id,
      learnerId: booking.learnerId?._id,
      title,
      description: description || "",
      fileType,
      fileUrl,
    });

    await newMaterial.save();

    return res.status(201).json({
      errorCode: 0,
      message: "✅ Upload tài liệu thành công",
      data: newMaterial,
    });
  } catch (error) {
    console.error("❌ Lỗi khi upload material:", error);
    return res.status(500).json({
      errorCode: 1,
      message: "Lỗi server khi lưu tài liệu.",
      error: error.message,
    });
  }
};


const getMaterials = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ errorCode: 1, message: "Thiếu bookingId" });
    }

    const list = await Material.find({ bookingId })
      .populate("subjectId", "name classLevel")
      .populate("tutorId", "name")
      .populate("learnerId", "username email");

    res.status(200).json({
      errorCode: 0,
      count: list.length,
      data: list,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách tài liệu:", err);
    res.status(500).json({
      errorCode: 1,
      message: err.message,
    });
  }
};


const createAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slots } = req.body; // slots = [{ dayOfWeek: 0, startTime: "10:00", endTime: "11:00" }, ...]

    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin gia sư cho tài khoản này.",
      });
    }

    const tutorId = tutor._id;

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có slot nào để tạo.",
      });
    }

    // Kiểm tra trùng lặp
    for (const slot of slots) {
      const exists = await TutorAvailability.findOne({
        tutorId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: `Đã có khung giờ ${slot.startTime} - ${slot.endTime} cho ngày thứ ${slot.dayOfWeek}`,
        });
      }
    }

    // Thêm mới
    const created = await TutorAvailability.insertMany(
      slots.map((s) => ({
        tutorId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }))
    );

    res.status(201).json({
      success: true,
      message: "Tạo lịch trống thành công.",
      data: created,
    });
  } catch (err) {
    console.error("Error creating availability:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTutorAvailability = async (req, res) => {
  try {
    const { tutorId } = req.params;

    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tutorId.",
      });
    }

    // 🔹 Lấy các khung giờ trống (isBooked = false)
    const availabilities = await TutorAvailability.find({
      tutorId,
      isBooked: false,
    }).sort({ dayOfWeek: 1, startTime: 1 });

    // 🔹 Lấy các lịch dạy (đã được booking approve)
    const schedules = await Schedule.find({
      tutorId,
      status: "approved",
    })
      .populate("learnerId", "fullName email")
      .populate("bookingId", "status")
      .sort({ date: 1, startTime: 1 });

    // 🔹 Gộp kết quả trả về
    return res.status(200).json({
      success: true,
      data: {
        availabilities,
        schedules,
      },
    });
  } catch (err) {
    console.error("Error fetching availability:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


const deleteAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;
    const userId = req.user.id;

    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin gia sư.",
      });
    }

    const slot = await TutorAvailability.findOne({
      _id: availabilityId,
      tutorId: tutor._id,
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy slot này hoặc không thuộc về bạn.",
      });
    }

    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: "Slot này đã được học viên đặt, không thể xoá.",
      });
    }

    // 🔹 Xóa slot
    await slot.deleteOne();

    res.json({
      success: true,
      message: "Đã xoá slot thành công.",
    });
  } catch (err) {
    console.error("Error deleting availability:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


const getActiveStatus = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    return res.status(200).json({ active: tutor.active });
  } catch (error) {
    console.error("Error getting tutor active status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * PUT /api/tutor/active-status
 * Cập nhật trạng thái hoạt động của tutor
 */
const updateActiveStatus = async (req, res) => {
  const { active } = req.body;

  if (typeof active !== "boolean") {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const tutor = await Tutor.findOneAndUpdate(
      { user: req.user.id },
      { active },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    return res.status(200).json({ success: true, active: tutor.active });
  } catch (error) {
    console.error("Error updating tutor active status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  respondBooking,
  cancelBooking,
  getPendingBookings,
  createSchedule,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  updateProgress,
  getProgress,
  uploadMaterial,
  getMaterials,
  getTutorAvailability,
  updateActiveStatus,
  getActiveStatus,
  createAvailability,
  deleteAvailability,
};

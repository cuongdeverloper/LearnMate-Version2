const Schedule = require("../../modal/Schedule");
const Booking = require("../../modal/Booking");
const ChangeRequest = require("../../modal/ChangeRequest");
const User = require("../../modal/User");
const Tutor = require("../../modal/Tutor");
const FinancialHistory = require("../../modal/FinancialHistory");
const TutorAvailability = require("../../modal/TutorAvailability");

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
exports.requestChangeSchedule = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { scheduleId, newDate, newStartTime, newEndTime, reason } = req.body;


    const booking = await Booking.findById(bookingId).populate(
      "tutorId learnerId"
    );
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy booking." });
    }

    if (!scheduleId || !newDate || !newStartTime || !newEndTime || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin yêu cầu đổi lịch." });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lịch học." });
    }

    if (
      schedule.learnerId.toString() !== req.user._id &&
      schedule.learnerId.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền đổi lịch này." });
    }

    const existingRequest = await ChangeRequest.findOne({
      scheduleId,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Đã có yêu cầu đổi lịch đang chờ duyệt.",
      });
    }

    const tutorId = schedule.tutorId;
    const targetDate = new Date(newDate);
    const dayOfWeek = targetDate.getDay();

    const availability = await TutorAvailability.findOne({
      tutorId,
      dayOfWeek,
      startTime: { $lte: newStartTime },
      endTime: { $gte: newEndTime },
      isBooked: false,
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "Gia sư không rảnh vào thời gian này.",
      });
    }

    const changeRequest = new ChangeRequest({
      scheduleId,
      learnerId: req.user._id || req.user.id,
      newDate,
      newStartTime,
      newEndTime,
      reason,
    });

    await changeRequest.save();

    return res.status(201).json({
      success: true,
      message: "Yêu cầu đổi lịch đã được gửi thành công.",
      data: changeRequest,
    });
  } catch (error) {
    console.error("❌ Error in requestChangeSchedule:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi gửi yêu cầu đổi lịch.",
      error: error.message,
    });
  }
};

exports.getMyChangeRequests = async (req, res) => {
  try {
    const learnerId = req.user._id || req.user.id;

    const requests = await ChangeRequest.find({ learnerId })
      .populate("scheduleId", "date startTime endTime tutorId")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error in getMyChangeRequests:", error);
    return res.status(500).json({
      success: false,
      message: "Server error when fetching change request history.",
    });
  }
};
// 1. Lấy slot bận trong tuần của booking
// Lấy toàn bộ slot bận trong tuần (mọi booking)
exports.getBusySlotsForWeek = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { weekStart } = req.query;

    if (!bookingId || bookingId === "undefined" || !weekStart) {
      return res.status(400).json({ message: "Missing or invalid parameters" });
    }

    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid bookingId format" });
    }

    const startDate = new Date(weekStart);
    const endDate = addDays(startDate, 7);

    const busySlots = await Schedule.find({
      date: { $gte: startDate, $lt: endDate },
    }).select("date startTime endTime bookingId");

    res.json(busySlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Thêm nhiều slot lịch cho booking
exports.addMultipleSlots = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { slots } = req.body;

    if (
      !bookingId ||
      bookingId === "undefined" ||
      !Array.isArray(slots) ||
      slots.length === 0
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid bookingId format" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const newSchedules = slots.map((s) => ({
      tutorId: booking.tutorId,
      learnerId: booking.learnerId,
      bookingId,
      date: new Date(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    await Schedule.insertMany(newSchedules);

    res.json({ message: "Slots added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Xóa slot lịch
exports.deleteScheduleSlot = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    if (!scheduleId || scheduleId === "undefined") {
      return res.status(400).json({ message: "Missing scheduleId" });
    }

    if (!scheduleId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid scheduleId format" });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule)
      return res.status(404).json({ message: "Schedule not found" });

    await schedule.deleteOne();

    res.json({ message: "Schedule slot deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLearnerWeeklySchedules = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in." });
    }

    const learnerId = req.user.id || req.user._id;

    const schedules = await Schedule.find({
      learnerId: learnerId,
    })
      .populate({
        path: "bookingId",
        select: "tutorId subjectId",
        populate: [
          {
            path: "tutorId",
            select: "user",
            populate: {
              path: "user",
              select: "username",
            },
          },
          {
            path: "subjectId",
            select: "name classLevel",
          },
        ],
      })
      .select("date startTime endTime bookingId attended status")
      .sort({ date: 1 }); // sắp xếp theo ngày tăng dần

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching learner's schedules:", error);
    res.status(500).json({ message: "Server error fetching schedules" });
  }
};
// ✅ Mark Attendance & trừ tiền từng buổi
exports.markAttendance = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { attended } = req.body;

    if (!scheduleId || !scheduleId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid scheduleId" });
    }

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule slot not found" });
    }

    if (
      schedule.learnerId.toString() !== (req.user.id || req.user._id).toString()
    ) {
      return res.status(403).json({
        message: "Forbidden: Bạn không có quyền cập nhật lịch trình này.",
      });
    }
    const tutorModel = await Tutor.findById(schedule.tutorId._id);
    const tutorUser = await User.findById(tutorModel.user._id);
    if (!tutorUser)
      return res.status(404).json({ message: "Không tìm thấy gia sư." });

    const booking = await Booking.findById(schedule.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking không tồn tại." });
    }

    if (booking.status !== "approve" && booking.status !== "completed") {
      return res.status(400).json({ message: "Booking không còn hiệu lực." });
    }
    if (booking.completed && attended === false) {
      return res.status(400).json({
        message: "Booking này đã hoàn thành, không thể hủy điểm danh nữa.",
      });
    }

    const now = new Date();
    const scheduleDatePart = schedule.date.toISOString().split("T")[0];
    const sessionStartTimeUTC = new Date(
      `${scheduleDatePart}T${schedule.startTime}:00.000Z`
    );

    if (now.getTime() < sessionStartTimeUTC.getTime()) {
      return res
        .status(400)
        .json({ message: "Không thể điểm danh cho buổi học chưa bắt đầu." });
    }
    // ✅ Update attendance
    schedule.attended = attended;
    await schedule.save();


      await booking.save();
    

    res.json({ message: "Điểm danh đã được cập nhật thành công", schedule });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật điểm danh." });
  }
};

exports.acceptChangeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thông tin gia sư." });
    }

    const changeRequest = await ChangeRequest.findById(requestId).populate(
      "scheduleId"
    );
    if (!changeRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy yêu cầu thay đổi." });
    }

    const schedule = await Schedule.findById(changeRequest.scheduleId);
    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lịch học." });
    }
    if (schedule.tutorId.toString() !== tutor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền phê duyệt yêu cầu này.",
      });
    }

    changeRequest.status = "approved";
    await changeRequest.save();

    schedule.date = changeRequest.newDate;
    schedule.startTime = changeRequest.newStartTime;
    schedule.endTime = changeRequest.newEndTime;
    await schedule.save();

    res.status(200).json({
      success: true,
      message: "Đã chấp nhận yêu cầu thay đổi và cập nhật lịch thành công.",
      changeRequest,
      updatedSchedule: schedule,
    });
  } catch (error) {
    console.error("Lỗi khi chấp nhận yêu cầu thay đổi:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xử lý yêu cầu thay đổi.",
      error: error.message,
    });
  }
};

exports.rejectChangeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thông tin gia sư." });
    }

    const changeRequest = await ChangeRequest.findById(requestId).populate(
      "scheduleId"
    );
    if (!changeRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy yêu cầu thay đổi." });
    }

    const schedule = await Schedule.findById(changeRequest.scheduleId);
    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lịch học." });
    }
    if (schedule.tutorId.toString() !== tutor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền từ chối yêu cầu này.",
      });
    }

    changeRequest.status = "rejected";
    await changeRequest.save();

    res.status(200).json({
      success: true,
      message: "❌ Đã từ chối yêu cầu thay đổi lịch.",
      changeRequest,
    });
  } catch (error) {
    console.error("Lỗi khi từ chối yêu cầu thay đổi:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xử lý yêu cầu thay đổi.",
      error: error.message,
    });
  }
};

exports.getChangeRequestsByTutor = async (req, res) => {
  try {
    const userId = req.user.id;

    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thông tin gia sư." });
    }

    const schedules = await Schedule.find({ tutorId: tutor._id }).select("_id");
    const scheduleIds = schedules.map((s) => s._id);

    const changeRequests = await ChangeRequest.find({
      scheduleId: { $in: scheduleIds },
    })
      .populate({
        path: "scheduleId",
        populate: [
          { path: "learnerId", select: "username email" },
          { path: "tutorId", select: "username" },
        ],
      })
      .populate("learnerId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: changeRequests.length,
      changeRequests,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu thay đổi:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách yêu cầu thay đổi.",
      error: error.message,
    });
  }
};

exports.getMyCourseSchedules = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in." });
    }

    const learnerId = req.user.id || req.user._id;

    const schedules = await Schedule.find({
      learnerId: learnerId,
    })
      .populate({
        path: "bookingId",
        select: "tutorId subjectId",
        populate: [
          {
            path: "tutorId",
            select: "user",
            populate: {
              path: "user",
              select: "username",
            },
          },
          {
            path: "subjectId",
            select: "name classLevel",
          },
        ],
      })
      .select("date startTime endTime bookingId attended status")
      .sort({ date: 1 }); // sắp xếp theo ngày tăng dần

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching learner's schedules:", error);
    res.status(500).json({ message: "Server error fetching schedules" });
  }
};

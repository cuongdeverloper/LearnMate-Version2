const Assignment = require("../../modal/Assignment");
const Tutor = require("../../modal/Tutor");
const User = require("../../modal/User");
const Booking = require("../../modal/Booking");
const AssignmentStorage = require("../../modal/AssignmentStorage");

const createAssignmentStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor" });

    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Không có file được upload" });

    const { title, description, subjectId, topic } = req.body;

    if (!title || !subjectId)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin cần thiết" });

    const newStorage = await AssignmentStorage.create({
      tutorId: tutor._id,
      subjectId,
      title,
      description,
      topic: topic || "Chưa phân loại",
      fileUrl: req.file.path,
    });

    res.status(200).json({
      success: true,
      message: "Tạo Assignment Storage thành công",
      data: newStorage,
    });
  } catch (error) {
    console.error("CreateAssignmentStorage Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const getAssignmentStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor" });

    const storages = await AssignmentStorage.find({ tutorId: tutor._id })
      .populate("subjectId", "name")
      .select("title description fileUrl subjectId topic");

    res.status(200).json({ success: true, data: storages });
  } catch (error) {
    console.error("GetAssignmentStorage Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const assignAssignmentFromStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor" });

    const {
      assignmentStorageId,
      bookingId,
      openTime,
      deadline,
      title,
      description,
    } = req.body;

    if (!assignmentStorageId || !bookingId || !deadline || !title)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu dữ liệu assign" });

    const booking = await Booking.findById(bookingId)
      .populate("learnerId", "_id")
      .populate("subjectId", "_id");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy booking" });

    const storage = await AssignmentStorage.findById(assignmentStorageId);
    if (!storage)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy Assignment Storage" });

    const newAssignment = await Assignment.create({
      assignmentStorageId,
      tutorId: tutor._id,
      learnerId: booking.learnerId._id,
      subjectId: booking.subjectId._id,
      bookingId,
      title,
      description,
      fileUrl: storage.fileUrl,
      openTime: openTime || null,
      deadline,
      topic: storage.topic || "Chưa phân loại",
    });

    res.status(200).json({
      success: true,
      message: "Assign bài tập thành công",
      data: newAssignment,
    });
  } catch (error) {
    console.error("AssignAssignmentFromStorage Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const assignMultipleAssignments = async (req, res) => {
  try {
    const { assignments, bookingIds } = req.body;

    if (!assignments?.length || !bookingIds?.length)
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });

    // ✅ Tìm tutor từ userId trong token
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor" });

    const createdAssignments = [];

    for (const bookingId of bookingIds) {
      const booking = await Booking.findById(bookingId);
      if (!booking) continue;

      const created = await Promise.all(
        assignments.map(async (a) => {
          const storage = await AssignmentStorage.findById(
            a.assignmentStorageId
          );
          if (!storage) return null;

          return Assignment.create({
            assignmentStorageId: a.assignmentStorageId,
            tutorId: tutor._id, // ✅ dùng tutor._id chứ không phải req.user.tutorId
            learnerId: booking.learnerId,
            subjectId: booking.subjectId,
            bookingId,
            title: a.title,
            description: a.description,
            fileUrl: storage.fileUrl,
            openTime: a.openTime,
            deadline: a.deadline,
            topic: storage.topic,
          });
        })
      );

      createdAssignments.push(...created.filter(Boolean));
    }

    res.status(200).json({
      success: true,
      message: "Giao tất cả assignment thành công",
      data: createdAssignments,
    });
  } catch (err) {
    console.error("assignMultipleAssignments Error:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ✅ Hàm này tương tự, chỉ đổi tên cho rõ ràng
const assignAssignmentToMultipleBookings = async (req, res) => {
  try {
    const { assignments, bookingIds } = req.body;

    if (!assignments?.length || !bookingIds?.length)
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });

    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor" });

    const createdAssignments = [];

    for (const bookingId of bookingIds) {
      const booking = await Booking.findById(bookingId);
      if (!booking) continue;

      const created = await Promise.all(
        assignments.map(async (a) => {
          const storage = await AssignmentStorage.findById(
            a.assignmentStorageId
          );
          if (!storage) return null;

          return Assignment.create({
            assignmentStorageId: a.assignmentStorageId,
            tutorId: tutor._id,
            learnerId: booking.learnerId,
            subjectId: booking.subjectId,
            bookingId,
            title: a.title,
            description: a.description,
            fileUrl: storage.fileUrl,
            openTime: a.openTime,
            deadline: a.deadline,
            topic: storage.topic,
          });
        })
      );

      createdAssignments.push(...created.filter(Boolean));
    }

    res.status(200).json({
      success: true,
      message: "Giao tất cả assignment thành công",
      data: createdAssignments,
    });
  } catch (err) {
    console.error("assignAssignmentToMultipleBookings Error:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const getAssignmentStorageById = async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Tutor.findOne({ user: req.user.id });
    const storage = await AssignmentStorage.findOne({
      _id: id,
      tutorId: tutor._id,
    }).populate("subjectId", "name topic");
    if (!storage) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy Assignment Storage" });
    }
    res.status(200).json({ success: true, data: storage });
  } catch (error) {
    console.error("getAssignmentStorageById Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const updateAssignmentStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    const { id } = req.params;
    const { title, description, topic } = req.body;

    const updated = await AssignmentStorage.findOneAndUpdate(
      { _id: id, tutorId: tutor._id },
      { title, description, topic },
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy Assignment Storage" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("updateAssignmentStorage Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
/**
 * ✏️ Cập nhật Assignment đã assign (deadline, mô tả, tiêu đề)
 */
const updateAssignedAssignment = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    const { id } = req.params;
    const { title, description, deadline, openTime } = req.body;

    const updated = await Assignment.findOneAndUpdate(
      { _id: id, tutorId: tutor._id },
      { title, description, deadline, openTime },
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy assignment" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("updateAssignedAssignment Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

/**
 * 🔍 Lọc assignment theo tiêu chí
 * query: ?subjectId=&learnerId=&status=
 */
const filterAssignmentsByTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    const { subjectId, learnerId, status } = req.query;
    const filter = { tutorId: tutor._id };

    if (subjectId) filter.subjectId = subjectId;
    if (learnerId) filter.learnerId = learnerId;
    if (status) filter.status = status;

    const assignments = await Assignment.find(filter)
      .populate("subjectId", "name classLevel")
      .populate("learnerId", "name email username")
      .populate("bookingId", "status startTime endTime")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    console.error("filterAssignmentsByTutor Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

/**
 * 🗑️ Xóa Assignment (chỉ khi chưa nộp)
 */
const deleteAssignedAssignment = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    const { id } = req.params;

    const assignment = await Assignment.findOne({
      _id: id,
      tutorId: tutor._id,
    });
    if (!assignment)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy assignment" });

    // Check nếu học viên đã nộp
    const submission = await AssignmentSubmission.findOne({ assignment: id });
    if (submission) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa vì học viên đã nộp bài.",
      });
    }

    await Assignment.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Đã xóa assignment" });
  } catch (error) {
    console.error("deleteAssignedAssignment Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
/**
 * 🧩 Lấy tất cả assignment
 */
const viewAssignment = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("subjectId", "name")
      .populate("learnerId", "name email username")
      .populate("tutorId", "user")
      .sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const viewAssignmentByTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor" });

    // Tìm các assignment do tutor này giao
    const assignments = await Assignment.find({ tutorId: tutor._id })
      .populate("subjectId", "name classLevel")
      .populate("learnerId", "name email username")
      .populate("bookingId", "status startTime endTime")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (err) {
    console.error("viewAssignmentByTutor Error:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const deleteAssignmentStorage = async (req, res) => {
  try {
    const { id } = req.params;
    await AssignmentStorage.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Đã xóa Assignment Storage" });
  } catch (error) {
    console.error("DeleteAssignmentStorage Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

/**
 * 🧩 Xem danh sách bài nộp
 */
const viewSubmission = async (req, res) => {
  try {
    const tutorUserId = req.user.id;

    // Tìm tutorId từ userId
    const tutor = await Tutor.findOne({ user: tutorUserId });
    if (!tutor) return res.status(404).json({ message: "Tutor không tồn tại" });

    // Lấy tất cả assignment do tutor này giao và đã submit
    const submissions = await Assignment.find({
      tutorId: tutor._id,
      submitted: true,
    })
      .populate("learnerId", "username email")
      .populate("subjectId", "name classLevel")
      .populate("bookingId", "startTime endTime")
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🧩 Chấm điểm bài tập
 */
const gradeAssignment = async (req, res) => {
  try {
    const { assignmentId, grade, feedback } = req.body;
    if (!assignmentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    assignment.grade = grade;
    assignment.feedback = feedback;

    await assignment.save();

    res.status(200).json({ message: "Chấm điểm thành công", data: assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    res.status(200).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAssignmentsForCourse = async (req, res) => {
  try {
    let assignments = await Assignment.find({
      bookingId: req.params.courseId,
    });

    const assignmentsWithSubmission = await Promise.all(
      assignments.map(async (a) => {
        const submission = await AssignmentSubmission.findOne({
          assignment: a._id,
          learnerId: req.user.id,
        });
        const assignmentObj = a.toObject();
        if (submission) {
          assignmentObj.submitted = true;
          assignmentObj.grade = submission.grade;
          assignmentObj.feedback = submission.feedback;
          assignmentObj.submittedDate = submission.submittedAt;
        } else {
          assignmentObj.submitted = false;
        }
        return assignmentObj;
      })
    );

    res.status(200).json(assignmentsWithSubmission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------- LEARNER -----------------------

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, note } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (assignment.learnerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền nộp bài tập này.",
      });
    }

    const now = new Date();
    const openTime = assignment.openTime ? new Date(assignment.openTime) : null;
    const deadline = new Date(assignment.deadline);

    // Chưa đến giờ mở
    if (openTime && now < openTime) {
      return res.status(400).json({
        success: false,
        message: `Bài tập chưa mở để nộp.\nThời gian mở: ${openTime.toLocaleString(
          "vi-VN",
          { dateStyle: "short", timeStyle: "short" }
        )}`,
      });
    }

    // Đã quá hạn
    if (now > deadline) {
      return res.status(400).json({
        success: false,
        message: `Đã quá hạn nộp bài!\nHạn cuối: ${deadline.toLocaleString(
          "vi-VN",
          { dateStyle: "short", timeStyle: "short" }
        )}`,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng tải lên file bài làm.",
      });
    }

    const submittedAt = new Date();
    const fileUrl = req.file ? req.file.path : null;

    assignment.note = note;
    assignment.submitFileUrl = fileUrl;
    assignment.submittedAt = submittedAt;
    assignment.submitted = true;

    await assignment.save();

    res
      .status(201)
      .json({ message: "Assignment submitted successfully", data: assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const viewGradeFeedback = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);

    res.status(200).json({
      message: "View grade feedback successfully",
      data: assignment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  // Storage CRUD
  createAssignmentStorage,
  getAssignmentStorage,
  getAssignmentStorageById,
  updateAssignmentStorage,
  deleteAssignmentStorage,

  // Assign actions
  assignAssignmentFromStorage,
  assignMultipleAssignments,
  assignAssignmentToMultipleBookings,

  // Assigned management
  viewAssignment,
  viewAssignmentByTutor,
  filterAssignmentsByTutor,
  updateAssignedAssignment,
  deleteAssignedAssignment,
  getAssignmentById,

  // Submission & grading
  viewSubmission,
  gradeAssignment,
  getAssignmentsForCourse,
  submitAssignment,
  viewGradeFeedback,
};

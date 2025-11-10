const Tutor = require('../../modal/Tutor');
const User = require('../../modal/User');
const SavedTutor = require('../../modal/SavedTutor');
const Review = require('../../modal/Review')

const Subject = require('../../modal/Subject'); // import Subject model

exports.getTutors = async (req, res) => {
  try {
    const { name, subject, subjects, minPrice, maxPrice, minRating, class: classGrade, location } = req.query;

    let filter = {};
    let userFilter = {};

    if (name) {
      userFilter.username = { $regex: name, $options: "i" };
    }

    if (location) {
      // tìm theo từ khóa, không phân biệt hoa thường
      filter.location = { $regex: location, $options: "i" };
    }

    if (subjects) {
      const subjectNames = decodeURIComponent(subjects).split(",").map(s => s.trim());
      const subjectDocs = await Subject.find({ name: { $in: subjectNames } });
      const subjectIds = subjectDocs.map(s => s._id);
      filter.subjects = { $in: subjectIds };
    } else if (subject) {
      const subjectDoc = await Subject.findOne({ name: { $regex: subject, $options: "i" } });
      if (subjectDoc) filter.subjects = subjectDoc._id;
      else return res.json({ success: true, tutors: [] });
    }

    if (classGrade) filter.classes = Number(classGrade);

    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    }

    let tutors = await Tutor.find(filter)
      .populate({
        path: "user",
        match: userFilter,
        select: "username email image phoneNumber gender",
      })
      .populate("subjects", "name classLevel");

    tutors = tutors.filter(t => t.user !== null);

    const tutorIds = tutors.map(t => t._id);
    const reviews = await Review.aggregate([
      { $match: { tutor: { $in: tutorIds } } },
      { $group: { _id: "$tutor", avgRating: { $avg: "$rating" } } }
    ]);

    const ratingMap = {};
    reviews.forEach(r => {
      ratingMap[r._id.toString()] = r.avgRating;
    });

    const resultTutors = tutors.map(tutor => {
      const avgRating = ratingMap[tutor._id.toString()] || 0;
      return { ...tutor.toObject(), rating: avgRating };
    });

    const finalTutors = minRating
      ? resultTutors.filter(t => t.rating >= Number(minRating))
      : resultTutors;

    res.json({ success: true, tutors: finalTutors });
  } catch (err) {
    console.error("Error in getTutors:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTutorById = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.tutorId)
      .populate("subjects", "name classLevel")
      .populate("user", "username email image phoneNumber gender");

    if (!tutor)
      return res.status(404).json({ success: false, message: "Tutor not found" });

    // Tính rating trung bình từ Review
    const reviews = await Review.find({ tutor: tutor._id });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const tutorWithRating = { ...tutor.toObject(), rating: avgRating };

    res.json({ success: true, tutor: tutorWithRating });
  } catch (err) {
    console.error("Error in getTutorById:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSavedTutors = async (req, res) => {
  try {
    // Lấy danh sách tutor đã lưu của user
    const savedTutors = await SavedTutor.find({ user: req.user.id || req.user._id })
    .populate({
      path: 'tutor',
      populate: [
        { path: 'user', select: 'username image' },
        { path: 'subjects', select: 'name classLevel' } // <- populate subjects đúng cách
      ]
    });

    // Tính rating trung bình cho từng tutor
    const tutorIds = savedTutors.map(st => st.tutor._id);
    const reviews = await Review.find({ tutor: { $in: tutorIds } });

    const ratingMap = {};
    reviews.forEach(r => {
      const tId = r.tutor.toString();
      if (!ratingMap[tId]) ratingMap[tId] = [];
      ratingMap[tId].push(r.rating);
    });

    const tutorsWithRating = savedTutors.map(st => {
      const tutor = st.tutor.toObject();
      const ratings = ratingMap[tutor._id.toString()] || [];
      const avgRating = ratings.length > 0 ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0;
      return { ...tutor, rating: avgRating };
    });

    res.status(200).json(tutorsWithRating);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách gia sư đã lưu:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};


exports.addSavedTutor = async (req, res) => {
  const { tutorId } = req.params;
  const userId = req.user.id || req.user._id; // Lấy ID người dùng từ token

  try {
    // Kiểm tra xem gia sư có tồn tại không
    const tutorExists = await Tutor.findById(tutorId);
    if (!tutorExists) {
      return res.status(404).json({ message: 'Gia sư không tồn tại.' });
    }

    // Kiểm tra xem đã lưu gia sư này chưa
    const existingSave = await SavedTutor.findOne({ user: userId, tutor: tutorId });
    if (existingSave) {
      return res.status(400).json({ message: 'Gia sư đã có trong danh sách lưu của bạn.' });
    }

    // Tạo một bản ghi SavedTutor mới
    const newSavedTutor = new SavedTutor({
      user: userId,
      tutor: tutorId,
    });

    await newSavedTutor.save();

    // Có thể trả về toàn bộ danh sách đã lưu được cập nhật
    const updatedSavedTutors = await SavedTutor.find({ user: userId }).populate('tutor');
    res.status(201).json({
      message: 'Gia sư đã được thêm vào danh sách.',
      savedTutors: updatedSavedTutors.map(item => item.tutor),
    });
  } catch (error) {
    console.error('Lỗi khi thêm gia sư vào danh sách:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};


exports.removeSavedTutor = async (req, res) => {
  const { tutorId } = req.params;
  const userId = req.user.id; // Lấy ID người dùng từ token

  try {
    const result = await SavedTutor.deleteOne({ user: userId, tutor: tutorId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Gia sư không có trong danh sách lưu của bạn.' });
    }

    // Trả về danh sách đã lưu sau khi xóa
    const updatedSavedTutors = await SavedTutor.find({ user: userId }).populate('tutor');
    res.status(200).json({
      message: 'Gia sư đã được xóa khỏi danh sách.',
      savedTutors: updatedSavedTutors.map(item => item.tutor),
    });
  } catch (error) {
    console.error('Lỗi khi xóa gia sư khỏi danh sách:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
// GET /api/tutors/by-subjects?subjects=Toán,Lý,Hóa


exports.getActiveStatus = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    return res.status(200).json({ active: tutor.active });
  } catch (error) {
    console.error('Error getting tutor active status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * PUT /api/tutor/active-status
 * Cập nhật trạng thái hoạt động của tutor
 */
exports.updateActiveStatus = async (req, res) => {
  const { active } = req.body;

  if (typeof active !== 'boolean') {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const tutor = await Tutor.findOneAndUpdate(
      { user: req.user.id },
      { active },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    return res.status(200).json({ success: true, active: tutor.active });
  } catch (error) {
    console.error('Error updating tutor active status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getMyTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user._id || req.user.id })
      .populate("subjects", "name classLevel");
    if (!tutor)
      return res.status(404).json({ message: "Tutor not found" });

    res.json(tutor);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Cập nhật thông tin tutor
exports.updateTutor = async (req, res) => {
  try {
    const { bio, subjects, pricePerHour, location, languages } = req.body;

    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    // Chỉ cho phép user sở hữu tutor đó cập nhật
    if (!tutor.user.equals(req.user._id || req.user.id))
      return res.status(403).json({ message: "Bạn không có quyền cập nhật hồ sơ này." });

    // Cập nhật các trường
    if (bio !== undefined) tutor.bio = bio;
    if (subjects !== undefined) tutor.subjects = subjects;
    if (pricePerHour !== undefined) tutor.pricePerHour = pricePerHour;
    if (location !== undefined) tutor.location = location;
    if (languages !== undefined) tutor.languages = languages;

    await tutor.save();

    const updatedTutor = await Tutor.findById(tutor._id).populate("subjects", "name classLevel");
    res.json({ message: "Cập nhật thành công", tutor: updatedTutor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Lấy danh sách tất cả môn học
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({}, "name classLevel");
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getSubjectsByTutor = async (req, res) => {
  try {
    const userId  = req.user.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Not authenticated" });
    }

    const tutor = await Tutor.findOne({ user: userId }).populate("subjects", "name classLevel");
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tutor với userId này." });
    }

    return res.status(200).json({
      success: true,
      tutorId: tutor._id,
      subjects: tutor.subjects,
    });
  } catch (error) {
    console.error("Error in getSubjectsByTutor:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách môn học theo tutor.",
      error: error.message,
    });
  }
};
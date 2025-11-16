// controller/Quiz/QuizController.js
const XLSX = require("xlsx");
const Quiz = require("../../modal/Quiz");
const Question = require("../../modal/Question");
const Booking = require("../../modal/Booking");
const Subject = require("../../modal/Subject");
const Tutor = require("../../modal/Tutor");
const User = require("../../modal/User");
const QuizAttempt = require("../../modal/QuizAttempt");
const Answer = require("../../modal/Answer");
const QuizStorage = require("../../modal/QuizStorage");
const QuestionStorage = require("../../modal/QuestionStorage");

// 🧩 Lấy tất cả quiz (admin hoặc test)
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("subjectId tutorId");
    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("GetAllQuizzes Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Không thể tải danh sách quiz." });
  }
};

// 🧩 Lấy quiz theo ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "subjectId tutorId"
    );

    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quiz." });

    const questions = await Question.find({ quizId: quiz._id });
    const quizAttempts = await QuizAttempt.find({
      userId: req.user.id,
      quizId: quiz._id,
    });
    const quizDetails = quiz.toObject();

    quizDetails.questions = questions;
    quizDetails.attempts = quizAttempts;

    res.status(200).json({ success: true, quiz: quizDetails });
  } catch (error) {
    console.error("GetQuizById Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy quiz." });
  }
};

// 🧩 Tạo quiz mới (có thể theo booking)

exports.createQuizFromStorage = async (req, res) => {
  try {
    const {
      quizStorageId,
      bookingId,
      title,
      duration,
      openTime,
      closeTime,
      topic,
    } = req.body;

    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor." });

    const quizStorage = await QuizStorage.findById(quizStorageId).populate(
      "questions"
    );
    if (!quizStorage)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy QuizStorage." });

    // ✅ openTime & closeTime nhập riêng
    const quiz = new Quiz({
      tutorId: tutor._id,
      subjectId: quizStorage.subjectId,
      bookingId,
      quizStorageId,
      title: title || quizStorage.name,
      description: quizStorage.description || "",
      topic: topic || quizStorage.topic,
      duration: duration || 1800, // thời lượng làm bài, không liên quan open/close
      openTime: openTime ? new Date(openTime) : new Date(),
      closeTime: closeTime
        ? new Date(closeTime)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await quiz.save();

    const newQuestions = quizStorage.questions.map((q) => ({
      tutorId: tutor._id,
      subjectId: quizStorage.subjectId,
      quizId: quiz._id,
      bookingId,
      sourceQuestionId: q._id,
      topic: q.topic,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));

    if (newQuestions.length > 0) await Question.insertMany(newQuestions);

    res.status(200).json({
      success: true,
      message: "✅ Quiz đã được tạo từ QuizStorage thành công!",
      quiz,
    });
  } catch (error) {
    console.error("CreateQuizFromStorage Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo quiz từ QuizStorage.",
    });
  }
};

// 🧩 Import câu hỏi từ file Excel
// Import Excel
exports.importQuestionsToStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tutor tương ứng với user này.",
      });
    }

    const { questions, subjectId } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách câu hỏi không hợp lệ!",
      });
    }

    const mappedQuestions = questions.map((q) => ({
      tutorId: tutor._id,
      subjectId,
      topic: q.topic?.trim() || "Chung",
      text: q.text,
      options: q.options,
      correctAnswer: Number(q.correctAnswer ?? 0),
    }));

    await QuestionStorage.insertMany(mappedQuestions);

    res.status(200).json({
      success: true,
      message: `✅ Import thành công ${mappedQuestions.length} câu hỏi.`,
    });
  } catch (error) {
    console.error("❌ ImportQuestionsToStorage Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi import câu hỏi vào storage.",
    });
  }
};

// 🧩 Lấy danh sách quiz theo tutor
exports.getQuizStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor." });

    const { subjectId, topic } = req.query;

    const filter = { tutorId: tutor._id };
    if (subjectId) filter.subjectId = subjectId;
    if (topic && topic.trim() !== "") filter.topic = topic.trim();

    const quizStorages = await QuizStorage.find(filter)
      .populate("subjectId", "name")
      .populate("questions")
      .sort({ createdAt: -1 });

    // Trích danh sách topic duy nhất
    const topics = [
      ...new Set(quizStorages.map((q) => q.topic).filter(Boolean)),
    ];

    res.status(200).json({
      success: true,
      quizzes: quizStorages,
      topics,
    });
  } catch (error) {
    console.error("❌ getQuizStorage Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy QuizStorage.",
    });
  }
};

exports.getQuestionStorage = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor." });

    const { subjectId, topic } = req.query;
    const filter = { tutorId: tutor._id };
    if (subjectId) filter.subjectId = subjectId;
    if (topic && topic !== "Tất cả") filter.topic = topic;

    // ✅ Lấy danh sách câu hỏi đúng filter
    const questions = await QuestionStorage.find(filter)
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    const topicFilter = { tutorId: tutor._id };
    if (subjectId) topicFilter.subjectId = subjectId;
    const topics = await QuestionStorage.distinct("topic", topicFilter);

    res.status(200).json({
      success: true,
      questions,
      topics,
    });
  } catch (error) {
    console.error("❌ GetQuestionStorage Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi tải QuestionStorage." });
  }
};

// 🧩 Lấy quiz theo booking
exports.getQuizzesByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { topic } = req.query;

    const filter = { bookingId };
    if (topic) filter.topic = topic;

    const quizzes = await Quiz.find(filter)
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("GetQuizzesByBookingId Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Không thể tải quiz theo booking." });
  }
};

exports.updateQuizTime = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { openTime, closeTime, duration } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quiz." });

    if (openTime) quiz.openTime = new Date(openTime);
    if (closeTime) quiz.closeTime = new Date(closeTime);
    if (duration) quiz.duration = duration;

    await quiz.save();
    res.status(200).json({
      success: true,
      message: "✅ Cập nhật thời gian quiz thành công.",
      quiz,
    });
  } catch (error) {
    console.error("UpdateQuizTime Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi cập nhật thời gian quiz." });
  }
};

// 🧩 Lấy danh sách câu hỏi của quiz
exports.getQuestionsByQuizId = async (req, res) => {
  try {
    const { quizId } = req.params;
    const questions = await Question.find({ quizId });
    res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("GetQuestionsByQuizId Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi tải câu hỏi." });
  }
};

// 🧩 Cập nhật câu hỏi
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { text, options, correctAnswer } = req.body;

    const updated = await Question.findByIdAndUpdate(
      questionId,
      { text, options, correctAnswer },
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy câu hỏi." });
    res.status(200).json({ success: true, question: updated });
  } catch (error) {
    console.error("UpdateQuestion Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi cập nhật câu hỏi." });
  }
};

// 🧩 Xoá câu hỏi
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const deleted = await QuestionStorage.findByIdAndDelete(questionId);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy câu hỏi." });
    res
      .status(200)
      .json({ success: true, message: "Đã xoá câu hỏi thành công." });
  } catch (error) {
    console.error("DeleteQuestion Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi xoá câu hỏi." });
  }
};

exports.getAllQuizzesByLearnerId = async (req, res) => {
  try {
    const learner = await User.findOne({ _id: req.user.id });

    if (!learner) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy learner." });
    }

    const joinedCourse = await Booking.find({ learnerId: learner._id });

    if (!joinedCourse) {
      return res.status(200).json({ success: true, quizzes: [] });
    }

    const joinedCourseIds = joinedCourse.map((course) => course._id);

    const quizzes = await Quiz.find({
      bookingId: { $in: joinedCourseIds },
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("Get all quizzes by learner Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách quiz theo learner.",
    });
  }
};

exports.addQuestionsFromStorageToQuiz = async (req, res) => {
  try {
    const { quizId, questionIds } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quiz." });

    const tutor = await Tutor.findOne({ user: req.user.id });

    const newQuestions = await Promise.all(
      questionIds.map(async (id) => {
        const questionData = await QuestionStorage.findById(id);
        if (!questionData) return null;

        const newQ = new Question({
          quizId: quiz._id,
          tutorId: tutor._id,
          subjectId: quiz.subjectId,
          text: questionData.text,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
        });
        await newQ.save();
        return newQ._id;
      })
    );

    quiz.questions.push(...newQuestions.filter(Boolean));
    await quiz.save();

    res.status(200).json({
      success: true,
      message: "✅ Đã thêm câu hỏi từ storage vào quiz.",
    });
  } catch (error) {
    console.error("AddQuestionsFromStorageToQuiz Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi thêm câu hỏi từ storage." });
  }
};

exports.createQuizStorage = async (req, res) => {
  try {
    const { title, questionIds, subjectId, topic } = req.body;

    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor." });

    // ⚙️ Tạo mới QuizStorage kèm topic
    const quizStorage = new QuizStorage({
      name: title,
      tutorId: tutor._id,
      subjectId,
      topic: topic || "Chưa phân loại",
      questions: questionIds || [],
    });

    await quizStorage.save();

    res.status(201).json({
      success: true,
      quizStorage,
      message: "Tạo QuizStorage thành công!",
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo QuizStorage:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi tạo QuizStorage." });
  }
};

exports.deleteQuizStorage = async (req, res) => {
  try {
    const { quizStorageId } = req.params;
    const deleted = await QuizStorage.findByIdAndDelete(quizStorageId);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy Quiz Storage." });
    res
      .status(200)
      .json({ success: true, message: "Đã xoá Quiz Storage thành công." });
  } catch (error) {
    console.error("Delete Quiz Storage Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi xoá Quiz Storage." });
  }
};

exports.updateQuizStorage = async (req, res) => {
  try {
    const { quizStorageId } = req.params;
    const { questionIds, name } = req.body;

    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tutor." });

    const quizStorage = await QuizStorage.findOne({
      _id: quizStorageId,
      tutorId: tutor._id,
    });
    if (!quizStorage)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy QuizStorage." });

    if (name) quizStorage.name = name;

    if (Array.isArray(questionIds)) {
      quizStorage.questions = questionIds;
    }

    await quizStorage.save();

    await quizStorage.populate("questions", "text topic options correctAnswer");

    res.status(200).json({
      success: true,
      message: "✅ Cập nhật QuizStorage thành công.",
      quizStorage,
    });
  } catch (error) {
    console.error("UpdateQuizStorage Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi cập nhật QuizStorage." });
  }
};

// controller/quiz/quizController.js
exports.getQuizzesByTutorWithStatus = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor)
      return res
        .status(404)
        .json({ success: false, message: "Tutor không tồn tại" });

    const { subjectId, topic } = req.query;

    // Lọc quiz theo tutor
    const filter = { tutorId: tutor._id };
    if (subjectId) filter.subjectId = subjectId;
    if (topic && topic.trim() !== "") filter.topic = topic;

    const quizzes = await Quiz.find(filter)
      .populate("subjectId", "name")
      .populate({
        path: "bookingId",
        populate: { path: "learnerId", select: "username email" },
      })
      .sort({ createdAt: -1 });

    // Lấy thông tin attempts/score cho mỗi quiz
    const quizzesWithStatus = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await QuizAttempt.find({ quizId: quiz._id });
        const latestAttempt = attempts.sort(
          (a, b) => b.createdAt - a.createdAt
        )[0];
        return {
          _id: quiz._id,
          title: quiz.title,
          topic: quiz.topic,
          subject: quiz.subjectId,
          booking: quiz.bookingId,
          attempted: attempts.length > 0,
          attemptsCount: attempts.length,
          score: latestAttempt ? latestAttempt.score : null,
          openTime: quiz.openTime,
          closeTime: quiz.closeTime,
        };
      })
    );

    res.status(200).json({ success: true, data: quizzesWithStatus });
  } catch (error) {
    console.error("getQuizzesByTutorWithStatus Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy danh sách quiz" });
  }
};

// ----------------------------- LEARNER -----------------------------

exports.getQuizDetailsById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).populate("subjectId tutorId");

    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quiz." });

    const questions = await Question.find({ quizId: quiz._id });
    const quizAttempts = await QuizAttempt.find({
      userId: req.user.id,
      quizId: quiz._id,
    });
    const quizDetails = {
      title: quiz.title,
      description: quiz.description,
      attempted: quiz.attempted,
      maxAttempts: quiz.maxAttempts,
      duration: quiz.duration,
      openTime: quiz.openTime,
      closeTime: quiz.closeTime,
      newestScore: quiz.newestScore,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };

    quizDetails.questions = questions;
    quizDetails.attempts = quizAttempts;

    res.status(200).json({ success: true, data: quizDetails });
  } catch (error) {
    console.error("GetQuizById Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy quiz." });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, startedAt, finishedAt, violationList } = req.body;
    console.log("answers: ", answers);

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quiz." });
    }

    if (quiz.attempted >= quiz.maxAttempts) {
      return res
        .status(400)
        .json({ success: false, message: "Quiz has been attempted maximum." });
    }

    const now = new Date(finishedAt);
    const openTime = quiz.openTime ? new Date(quiz.openTime) : null;
    const closeTime = quiz.closeTime ? new Date(quiz.closeTime) : null;

    if (openTime && now < openTime) {
      return res.status(400).json({
        success: false,
        message: `Quiz chưa mở. Thời gian mở: ${openTime.toLocaleString(
          "vi-VN"
        )}`,
      });
    }

    if (closeTime && now > closeTime) {
      return res.status(400).json({
        success: false,
        message: `Quiz đã đóng. Thời gian đóng: ${closeTime.toLocaleString(
          "vi-VN"
        )}`,
      });
    }

    const questions = await Question.find({ quizId });
    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Quiz này chưa có câu hỏi.",
      });
    }

    const results = await Promise.all(
      questions.map(async (question) => {
        const answerStr = answers[question._id.toString()];

        const selectedAnswer =
          answerStr !== undefined ? Number(answerStr) : null;

        if (selectedAnswer === null || isNaN(selectedAnswer)) {
          return false;
        }

        const isCorrect = selectedAnswer === question.correctAnswer;
        return isCorrect;
      })
    );

    const correctAnswers = results.filter((isCorrect) => isCorrect).length;

    console.log("🥪🥪🥪 Correct Answers:", correctAnswers);

    const quizAttempt = new QuizAttempt({
      quizId,
      learnerId: req.user.id,
      bookingId: quiz.bookingId,
      totalQuestions: questions.length,
      correctAnswers,
      score: (correctAnswers / questions.length) * 100,
      startedAt,
      finishedAt,
      violationList,
    });

    await quizAttempt.save();

    await Promise.all(
      questions.map(async (question) => {
        const answerStr = answers[question._id.toString()];

        const selectedAnswer =
          answerStr !== undefined ? Number(answerStr) : null;

        let isCorrect = true;

        if (selectedAnswer === null || isNaN(selectedAnswer) || !isCorrect) {
          isCorrect = false;
        } else if (selectedAnswer === question.correctAnswer) {
          isCorrect = true;
        } else {
          isCorrect = false;
        }

        const answer = new Answer({
          quizAttemptId: quizAttempt._id,
          questionId: question._id,
          selectedAnswer:
            selectedAnswer !== null && !isNaN(selectedAnswer)
              ? selectedAnswer
              : null,
          isCorrect: isCorrect,
        });

        await answer.save();
        return isCorrect;
      })
    );

    const attempts = await QuizAttempt.find({
      quizId,
      bookingId: quiz.bookingId,
    }).sort({ score: -1, finishedAt: 1 });

    quiz.attempted += 1;
    quiz.newestScore = (correctAnswers / questions.length) * 100;
    await quiz.save();

    let rank = 1;
    let totalParticipants = 1;
    let scoreList = [];

    if (quiz.quizStorageId) {
      const relatedQuizzes = await Quiz.find({
        quizStorageId: quiz.quizStorageId,
      }).select("newestScore title attempted");

      scoreList = relatedQuizzes.map((q) => ({
        score: q.newestScore || 0,
        quizId: q._id,
        title: q.title,
      }));
    }

    totalParticipants = scoreList.length;

    scoreList.sort((a, b) => b.score - a.score);
    const currentScore = quiz.newestScore || 0;

    const betterThanMe = scoreList.filter((s) => s.score > currentScore).length;
    rank = betterThanMe + 1;

    const result = {
      latestAttempt: quizAttempt,
      attempts,

      questions,
      answers,
      rank,
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Submit Quiz Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi nộp bài quiz!" });
  }
};

exports.getQuizResultById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quiz." });
    }

    const questions = await Question.find({ quizId }).lean();

    const attempts = await QuizAttempt.find({
      quizId: quizId,
      bookingId: quiz.bookingId,
    })
      .sort({ startedAt: -1 })
      .lean();

    if (attempts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          quiz,
          latestAttempt: null,

          attempts: [],
          questions,
          answers: [],
        },
        message: "Người học chưa thực hiện bài quiz nào.",
      });
    }

    const latestQuizAttempt = attempts[0];

    const answers = await Answer.find({ quizAttemptId: latestQuizAttempt._id });

    const result = {
      quiz,
      latestAttempt: latestQuizAttempt,

      attempts,
      questions,
      answers,
      rank: 1,
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("GetQuizById Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy quiz result." });
  }
};

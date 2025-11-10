const express = require("express");
const { checkAccessToken } = require("../middleware/JWTAction");

const {
  getMyAllCoursesDetails,
  getMyCourseDetails,
  getScheduleForCourse,
  getQuizzesForCourse,
  getAssignmentsForCourse,
  getProgressDetailsForCourse,
} = require("../controller/course/courseController");

const router = express.Router();

router.get(
  "/my-courses/approved/details",
  checkAccessToken,
  getMyAllCoursesDetails
);

router.get(
  "/my-courses/approved/:courseId/details",
  checkAccessToken,
  getMyCourseDetails
);

router.get(
  "/my-courses/approved/:courseId/schedule",
  checkAccessToken,
  getScheduleForCourse
);

router.get(
  "/my-courses/approved/:courseId/quizzes",
  checkAccessToken,
  getQuizzesForCourse
);

router.get(
  "/my-courses/approved/:courseId/assignments",
  checkAccessToken,
  getAssignmentsForCourse
);

router.get(
  "/my-courses/approved/:courseId/progress/details",
  checkAccessToken,
  getProgressDetailsForCourse
);

module.exports = router;

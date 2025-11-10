const express = require("express");
const RouterTutor = express.Router();
const uploadCloud = require("../config/cloudinaryConfig");
const tutorCtrl = require("../controller/Tutor/TutorController");
const TutorApplication = require("../controller/Tutor/TutorApplicationController");
const BookingController = require("../controller/Booking/bookingController");
const ReviewController = require("../controller/Review/ReviewController");
const { checkAccessToken } = require("../middleware/JWTAction");
const { getAllStudents } = require("../controller/User/UserController");
const uploadDocs = require("../config/cloudinaryDocxConfig");
const { getMyTutor,updateTutor,getAllSubjects, getSubjectsByTutor } = require('../controller/User/TutorController');

const {
  submitApplication,
  getTutorApplications,
  getAllApplications,
  getApplicationsByStatus,
  getApplicationById,
  approveApplication,
  rejectApplication,
} = require("../controller/Tutor/TutorApplicationController");
const { acceptChangeRequest, rejectChangeRequest, getChangeRequestsByTutor } = require("../controller/Schedule/ScheduleController");
const { checkTutorRole } = require("../middleware/tutorMiddleware");

RouterTutor.post("/bookings/respond", checkAccessToken, tutorCtrl.respondBooking);

RouterTutor.post("/bookings/cancel", checkAccessToken, tutorCtrl.cancelBooking);

RouterTutor.get("/bookings/pending/:tutorId", checkAccessToken, tutorCtrl.getPendingBookings);

RouterTutor.post("/schedule",checkAccessToken, checkTutorRole,tutorCtrl.createSchedule);
RouterTutor.get("/scheduleTutor",checkAccessToken,checkTutorRole, tutorCtrl.getSchedule);
RouterTutor.put("/schedule/:id", checkAccessToken,checkTutorRole,tutorCtrl.updateSchedule);
RouterTutor.delete("/schedule/:id",checkAccessToken ,checkTutorRole,tutorCtrl.deleteSchedule);

RouterTutor.post("/progress", checkTutorRole,tutorCtrl.updateProgress);
RouterTutor.get("/progress/:studentId", checkTutorRole,tutorCtrl.getProgress);

// RouterTutor.post('/material/upload', tutorCtrl.uploadMaterial);
RouterTutor.post(
  "/material/upload",
  uploadDocs.single("file"),
  checkAccessToken,
  tutorCtrl.uploadMaterial
);
RouterTutor.get("/material/:bookingId", checkAccessToken,checkTutorRole,tutorCtrl.getMaterials);

RouterTutor.post(
  "/application",
  checkAccessToken,
  uploadDocs.single("cvFile"),
  TutorApplication.submitApplication
);

RouterTutor.get(
  "/tutor/applications",
  checkAccessToken,checkTutorRole,
  TutorApplication.getTutorApplications
);
RouterTutor.get(
  "/tutor/:tutorId/bookings",
  checkAccessToken,checkTutorRole,
  BookingController.getAllBookingsByTutorId
);
RouterTutor.get(
  "/materials/booking/:bookingId",
  checkAccessToken,checkTutorRole,
  tutorCtrl.getMaterials
);
RouterTutor.get("/students", checkAccessToken,checkTutorRole,getAllStudents);
RouterTutor.get("/:tutorId/availability", checkAccessToken, tutorCtrl.getTutorAvailability); // Public route
RouterTutor.get("/review/:tutorId", checkAccessToken, ReviewController.getReviewsByTutor); // Public route
RouterTutor.get("/active-status", checkAccessToken, tutorCtrl.getActiveStatus);
RouterTutor.put(
  "/active-status",
  checkAccessToken,checkTutorRole,
  tutorCtrl.updateActiveStatus
);

RouterTutor.post(
  "/application",
  checkAccessToken,checkTutorRole,
  uploadCloud.single("cvFile"), 
  submitApplication
);


RouterTutor.get("/me", checkAccessToken, getMyTutor);
RouterTutor.put("/:id", checkAccessToken, updateTutor);
RouterTutor.get("/subjects", getAllSubjects);

RouterTutor.post("/createavailability", checkAccessToken, checkTutorRole,tutorCtrl.createAvailability);
RouterTutor.delete("/:availabilityId", checkAccessToken, checkTutorRole,tutorCtrl.deleteAvailability);
RouterTutor.get("/subjects-by-tutor", checkAccessToken, checkTutorRole,getSubjectsByTutor);

RouterTutor.put("/:requestId/accept", checkAccessToken, checkTutorRole,acceptChangeRequest);
RouterTutor.put("/:requestId/reject", checkAccessToken, checkTutorRole,rejectChangeRequest);
RouterTutor.get("/getChangeRequestsTutor", checkAccessToken, checkTutorRole,getChangeRequestsByTutor);
module.exports = RouterTutor;

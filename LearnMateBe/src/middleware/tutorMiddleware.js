const checkTutorRole = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        EC: -1,
        EM: "Unauthorized: Missing user information",
      });
    }

    if (req.user.role !== "tutor") {
      return res.status(403).json({
        EC: -1,
        EM: "Access denied: Tutor role required",
      });
    }

    next();
  } catch (error) {
    console.error("❌ Error in checkTutorRole:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Server error in role validation",
    });
  }
};

module.exports = { checkTutorRole };

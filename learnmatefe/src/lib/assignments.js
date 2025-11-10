export const calculateAssignmentStatus = (assignment, today = new Date()) => {
  if (assignment.grade !== undefined) {
    return "Graded";
  }
  if (assignment.submitted) {
    return "Submitted";
  }
  if (assignment.deadline && isOverdue(assignment.deadline)) {
    return "Overdue";
  }
  if (assignment.openTime && today < new Date(assignment.openTime)) {
    return "Upcoming";
  }
  return "Active";
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vn-VN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const isOverdue = (dueDate) => {
  return new Date() > new Date(dueDate);
};

export const getDaysUntilDue = (dueDate) => {
  const now = new Date();
  const timeDiff = new Date(dueDate).getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

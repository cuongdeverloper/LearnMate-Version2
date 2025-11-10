import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  calculateAssignmentStatus,
  getDaysUntilDue,
  isOverdue,
} from "../../lib/assignments";
import { AlertCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssignments,
  selectAssignment,
} from "../../redux/action/courseActions";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const AssignmentsTab = ({ courseTitle }) => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedCourse, assignments, submitting } =
    useSelector((state) => state.courses);
  useEffect(() => {
    dispatch(fetchAssignments(selectedCourse));
  }, [selectedCourse, dispatch, submitting]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Graded":
        return <Badge variant="default" className="text-white">Graded</Badge>;
      case "Submitted":
        return <Badge variant="secondary">Submitted</Badge>;
      case "overdue":
        return (
          <Badge variant="overdue" className="gap-1">
            <AlertCircle className="w-3 h-3" /> Overdue
          </Badge>
        );
      case "Upcoming":
        return <Badge variant="upcoming" className="gap-1">Upcoming</Badge>;
      case "Active":
        return <Badge variant="active">Active</Badge>;
      default:
        return null;
    }
  };


  const handleSubmitAssignment = (assignmentId) => {
    dispatch(selectAssignment(assignmentId));
    navigate(`/user/assignments/${assignmentId}/submit`);
  };

  const handleViewFeedback = (assignmentId) => {
    dispatch(selectAssignment(assignmentId));
    navigate(`/user/assignments/${assignmentId}/feedback`);
  };

  if (!courseId) return null;


  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Tiêu đề</TableHead>
              <TableHead className="font-semibold">Thời gian</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="text-center font-semibold">
                Điểm số
              </TableHead>
              <TableHead className="text-center font-semibold">
                Phản hồi
              </TableHead>
              <TableHead className="text-center font-semibold">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments?.length > 0 &&
              assignments?.map((assignment) => {
                assignment = { ...assignment, status: "pending" };
                const status = calculateAssignmentStatus(assignment);
                const daysLeft = getDaysUntilDue(assignment.deadline);
                const showOverdueWarning =
                  isOverdue(assignment.deadline) && !assignment.submitted;

                return (
                  <TableRow key={assignment._id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      <div>
                        <p>{assignment.title}</p>
                        {showOverdueWarning && (
                          <p className="text-xs text-destructive mt-1">
                            ⚠️ Overdue
                          </p>
                        )}
                        {!showOverdueWarning &&
                          daysLeft > 0 &&
                          !assignment.submitted && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                            </p>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span>Mở: {formatDate(assignment.openTime)} -</span>
                        <span>Hạn: {formatDate(assignment.deadline)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(status)}</TableCell>
                    <TableCell className="text-center">
                      {assignment.grade !== undefined ? (
                        <span className="font-semibold text-primary">
                          {assignment.grade}/{assignment.maxGrade || 10}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {assignment.feedback ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewFeedback(assignment._id)}
                        >
                          Xem phản hồi
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {status === "Active" && (
                        <Button
                          className="text-white"
                          variant="default"
                          size="sm"
                          onClick={() => handleSubmitAssignment(assignment._id)}
                        >
                          Nộp bài
                        </Button>
                      )}

                      {status === "Submitted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleViewFeedback(assignment._id);
                          }}
                        >
                          Xem bài đã nộp
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Chưa có bài tập nào.</p>
        </div>
      )}
    </div>
  );
};

export default AssignmentsTab;

import React, { useEffect } from "react";
import { Card } from "../ui/Card";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuizzes, selectQuiz } from "../../redux/action/courseActions";
import { getDaysUntilDue, isOverdue } from "../../lib/assignments";

const statusFor = (openTime, deadline, attempted, maxAttempts) => {
  const now = new Date();

  if (attempted === 0 && now > new Date(deadline)) return "Overdue";

  if (attempted === maxAttempts || (attempted > 0 && now > new Date(deadline)))
    return "Completed";

  if (openTime && now < new Date(openTime)) return "Upcoming";

  return "Active";
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const QuizzesTab = () => {
  const now = new Date();
  const dispatch = useDispatch();

  const { selectedCourse, quizzes, submitting, loading, error } = useSelector(
    (state) => state.courses
  );

  useEffect(() => {
    if (selectedCourse) {
      dispatch(fetchQuizzes(selectedCourse));
    }
  }, [dispatch, selectedCourse, submitting]);

  const handleSelectQuiz = (quizId) => {
    dispatch(selectQuiz(quizId));
  };

  return (
    <Card className="p-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Các nỗ lực</TableHead>
            <TableHead>Điểm số</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes &&
            quizzes.length > 0 &&
            quizzes?.map((q) => {
              const status = statusFor(
                q.openTime,
                q.closeTime,
                q.attempted,
                q.maxAttempts
              );

              const daysLeft = getDaysUntilDue(q.closeTime);
              const showOverdueWarning =
                isOverdue(q.closeTime) && q.attempted == 0;

              return (
                <TableRow key={q._id}>
                  <TableCell className="font-medium">
                    {q.title}
                    {showOverdueWarning && (
                      <p className="text-xs text-destructive mt-1">
                        ⚠️ Overdue
                      </p>
                    )}
                    {!showOverdueWarning &&
                      daysLeft > 0 &&
                      q.attempted == 0 && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                        </p>
                      )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>Mở: {formatDate(q.openTime)} -</span>
                      <span>Hạn: {formatDate(q.closeTime)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {status === "Upcoming" && (
                      <Badge variant="secondary" className="text-white">
                        Upcoming
                      </Badge>
                    )}
                    {status === "Active" && (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                        Active
                      </Badge>
                    )}

                    {status === "Completed" && (
                      <Badge className="bg-slate-800 hover:bg-slate-800 text-white">
                        Completed
                      </Badge>
                    )}
                    {status === "Overdue" && (
                      <Badge className="bg-slate-800 hover:bg-slate-800 text-white">
                        Overdue
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {q?.attempted} / {q?.maxAttempts}
                  </TableCell>
                  <TableCell>
                    {q.attempted > 0
                      ? Number(q.newestScore).toFixed(0) + "%"
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right flex flex-col gap-2">
                    {status === "Active" && (
                      <Button
                        className="text-white"
                        asChild
                        onClick={() => handleSelectQuiz(q._id)}
                      >
                        <Link to={`/user/quizzes/${q._id}/take`}>
                          {q.attempted > 0 && q.attempted < q.maxAttempts
                            ? "Thử lại " +
                              "(còn " +
                              (q.maxAttempts - q.attempted) +
                              " lần thử)"
                            : q.attempted === 0
                            ? "Bắt đầu"
                            : "Xem kết quả"}
                        </Link>
                      </Button>
                    )}
                    {status === "Completed" && (
                      <Button
                        className="text-white"
                        asChild
                        variant="secondary"
                        onClick={() => handleSelectQuiz(q._id)}
                        disabled={q.attempted === q.maxAttempts}
                      >
                        <Link to={`/user/quizzes/${q._id}/result`}>
                          {q.attempted < q.maxAttempts && "Thử lại"}
                          {q.attempted >= q.maxAttempts && "Xem kết quả"}
                        </Link>
                      </Button>
                    )}
                    {(status == "Active" || status == "Completed") && (
                      <Button
                        asChild
                        variant="outline"
                        onClick={() => handleSelectQuiz(q._id)}
                      >
                        <Link to={`/user/quizzes/${q._id}/result`}>
                          Xem kết quả
                        </Link>
                      </Button>
                    )}
                    {status === "Upcoming" && (
                      <Button
                        asChild
                        variant="outline"
                        onClick={() => handleSelectQuiz(q._id)}
                      >
                        <Link to={`/user/quizzes/${q._id}`}>Xem thông tin</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default QuizzesTab;

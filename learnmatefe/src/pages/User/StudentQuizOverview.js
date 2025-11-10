import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge, Badge as Status } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { format } from "date-fns";
import { Card } from "../../components/ui/Card";
import { ArrowLeft, Clock, FileText, Info, Trophy } from "lucide-react";
import { Separator } from "../../components/ui/Separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/AlertDialog";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "../../lib/utils";
import { fetchQuizDetailsById } from "../../redux/action/courseActions";

const statusFor = (now, start, end) => {
  if (now < start) return "Upcoming";
  if (now > end) return "Completed";
  return "Active";
};

const StudentQuizOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { quizDetails, selectedCourse } = useSelector((state) => state.courses);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchQuizDetailsById(id));
  }, [id]);

  const state = useMemo(() => {
    if (!quizDetails) return null;
    const now = Date.now();
    const start = new Date(quizDetails.openTime).getTime();
    const end = new Date(quizDetails.closeTime).getTime();
    return statusFor(now, start, end);
  }, [quizDetails]);

  if (!quizDetails) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(`/user/my-courses/${selectedCourse}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại khóa học
        </Button>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {quizDetails?.title || "Quiz Details"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Tổng quan cho bài kiểm tra: {quizDetails.title}
            </p>
            {!quizDetails && (
              <div className="mt-2 text-xs">
                <Status variant="secondary">Đang tải...</Status>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {state === "Active" && (
              <Button onClick={() => setConfirmOpen(true)}>
                Bắt đầu bài kiểm tra
              </Button>
            )}
            {state === "Upcoming" && (
              <Button variant="outline" disabled>
                Starts {formatDate(quizDetails.openTime)}
              </Button>
            )}
            {state === "Completed" &&
              (submitted ? (
                <Button asChild variant="secondary">
                  <Link to={`/student/quiz/${id}/result`}>Xem kết quả</Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Closed
                </Button>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Hướng dẫn</h2>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>
                  Bạn sẽ có {quizDetails.duration / 60} phút để hoàn thành bài
                  kiểm tra.
                </li>
                <li>Mỗi câu hỏi có một câu trả lời đúng. Chọn 1–4.</li>
                <li>
                  Câu trả lời của bạn sẽ được tự động lưu sau mỗi lần lựa chọn.
                </li>
                <li>
                  Sau khi gửi, bạn không thể thay đổi câu trả lời của mình.
                </li>
              </ul>
              <Separator className="my-4" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-md border p-4">
                  <div className="text-sm text-muted-foreground">Khả dụng</div>
                  <div className="mt-1 font-medium">
                    {formatDate(quizDetails.openTime)} -{" "}
                    {formatDate(quizDetails.closeTime)}
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="text-sm text-muted-foreground">
                    Khoảng thời gian
                  </div>
                  <div className="mt-1 font-medium">
                    {quizDetails.duration / 60} phút
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="text-sm text-muted-foreground">
                    Trạng thái
                  </div>
                  <div className="mt-1 font-medium flex items-center gap-2">
                    {state === "Upcoming" && (
                      <Badge variant="secondary">Upcoming</Badge>
                    )}
                    {state === "Active" && (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                        Active
                      </Badge>
                    )}
                    {state === "Completed" && (
                      <Badge className="bg-slate-800 hover:bg-slate-800 text-white">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="text-sm text-muted-foreground">
                    Số câu hỏi
                  </div>
                  <div className="mt-1 font-medium">
                    {quizDetails?.questions?.length ?? 0}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <h2 className="font-semibold text-2xl">Tổng quan</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {quizDetails.description}
              </p>
            </Card>
          </div>
          <aside className="space-y-6">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-2xl">Thông tin nhanh</h3>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Mở</dt>
                  <dd className="font-medium">
                    {formatDate(quizDetails.openTime)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Đóng</dt>
                  <dd className="font-medium">
                    {formatDate(quizDetails.closeTime)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Các nỗ lực</dt>
                  <dd className="font-medium">
                    {quizDetails.attempted} / {quizDetails.maxAttempts}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Score</dt>
                  <dd className="font-medium">
                    {quizDetails.attempted > 0 ? quizDetails.newestScore : "-"}
                  </dd>
                </div>
              </dl>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-2xl">
                  Mục tiêu hướng tới là gì
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Mục tiêu đạt 80% trở lên. Bạn có thể xem lại phần giải thích sau
                khi nộp bài.
              </p>
            </Card>
          </aside>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start quiz now?</AlertDialogTitle>
              <AlertDialogDescription>
                The timer will start immediately. You will have{" "}
                {quizDetails.duration} minutes to complete the quiz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => navigate(`/student/quiz/${id}/take`)}
              >
                Start Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default StudentQuizOverview;

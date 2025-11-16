import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

import {
  fetchQuizResult,
  fetchQuizExplanations,
} from "../../redux/action/courseActions";

const getTimeTaken = (startedAt, finishedAt) => {
  const timeTakenInSeconds =
    (new Date(finishedAt) - new Date(startedAt)) / 1000;

  return `${Math.floor(timeTakenInSeconds / 60)}:${String(
    timeTakenInSeconds % 60
  ).padStart(2, "0")}`;
};

function formatDateTime(isoString) {
  const date = new Date(isoString);

  const options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", options);
}

const StudentQuizResult = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selectedCourse,

    quizzes,
    selectedQuiz,
    quizDetails,
    quizResult,
    explanations,
    loadingExplanations,

    submitting,
    loading,
    error,
  } = useSelector((state) => state.courses);

  useEffect(() => {
    if (!quizResult?.questions) return;

    const questions = quizResult.questions.map((q) => ({
      id: q._id,
      text: q.text,
      options: q.options,
      correctAnswer: q.options[q.correctAnswer - 1],
    }));

    const getExplanations = async () => {
      await dispatch(fetchQuizExplanations(questions));
    };

    getExplanations();
  }, [quizResult]);

  const { id } = useParams();

  useEffect(() => {
    dispatch(fetchQuizResult(selectedQuiz));
  }, [dispatch, selectedQuiz, submitting]);

  if (submitting || loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-600">Đang tải... Vui lòng chờ</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(`/user/my-courses/${selectedCourse}`)}
              className="mb-6 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại khóa học
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {quizDetails.title}
            </h1>
            <p className="text-muted-foreground">
              Quiz ID: {quizResult?.latestAttempt?.quizId}
            </p>
          </div>
          <Button
            asChild
            className="text-white"
            disabled={
              quizResult?.quiz?.attempted >= quizResult?.quiz?.maxAttempts
            }
          >
            <Link
              to={`/user/quizzes/${id}/take`}
              onClick={(e) => {
                if (
                  quizResult?.quiz?.attempted >= quizResult?.quiz?.maxAttempts
                ) {
                  e.preventDefault();
                  toast.warning("Bạn đã hết lượt thử quiz này!");
                }
              }}
            >
              Thử lại lần nữa{" "}
              {quizResult?.quiz?.attempted < quizResult?.quiz?.maxAttempts
                ? "(còn " +
                  (quizResult?.quiz?.maxAttempts -
                    quizResult?.quiz?.attempted) +
                  " lần thử)"
                : ""}
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Điểm số</div>
            <div className="text-2xl font-semibold">
              {Number(quizResult?.latestAttempt?.score).toFixed(0)}%
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Số câu đúng</div>
            <div className="text-2xl font-semibold">
              {quizResult?.latestAttempt?.correctAnswers}/
              {quizResult?.latestAttempt?.totalQuestions}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">
              Thời gian hoàn thành
            </div>
            <div className="text-2xl font-semibold">
              {getTimeTaken(
                quizResult?.latestAttempt?.startedAt,
                quizResult?.latestAttempt?.finishedAt
              )}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Xếp hạng</div>
            <div className="text-2xl font-semibold">{quizResult?.rank}</div>
          </div>
        </div>
        <div className="mt-8 rounded-lg border p-6">
          <div className="font-medium mb-2">Lịch sử làm bài</div>
          <div className="flex flex-col gap-3">
            {quizResult?.attempts?.map((attempt) => (
              <div
                key={attempt._id}
                className="flex flex-col gap-2 hover:bg-purple-400/10 rounded-lg px-4 py-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bài tập</span>
                  <span>{Number(attempt.score).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${Number(attempt.score).toFixed(0)}%` }}
                  />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(attempt?.startedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-lg border p-6">
          <div className="font-medium mb-2">Phát hiện gian lận</div>
          {quizResult?.latestAttempt?.violationList?.length === 0 && (
            <div className="text-sm text-muted-foreground px-4 py-2">
              Không phát hiện gian lận
            </div>
          )}
          {quizResult?.latestAttempt?.violationList?.map((v) => (
            <div className="text-sm text-muted-foreground px-4 py-2">
              ⚠️ {v}
            </div>
          ))}
        </div>

        <div className="font-medium text-2xl mb-6 mt-16">Chi tiết bài thi</div>
        {quizResult?.questions?.map((q, index) => {
          const answer = quizResult?.answers?.filter(
            (a) => a.questionId === q._id
          )[0];

          let isCorrect = false;
          let isAnswered = true;

          if (
            answer?.selectedAnswer === null ||
            answer?.selectedAnswer === "" ||
            answer?.selectedAnswer === undefined
          ) {
            isAnswered = false;
          } else {
            if (answer?.selectedAnswer === q.correctAnswer) isCorrect = true;
          }

          console.log(
            "question: ",
            index,
            " isAnswered: ",
            isAnswered,
            " isCorrect: ",
            isCorrect
          );

          const explanation = explanations?.find((e) => e.questionId === q._id)
            ?.explanation?.parts[0]?.text;

          return (
            <div
              key={q._id}
              className="border rounded-lg p-3 bg-white shadow-sm mb-3"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-lg text-gray-900">
                  Câu {index + 1}: {q.text}
                </h3>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isCorrect ? "text-green-600" : "text-red-600"
                  )}
                >
                  {isAnswered ? (isCorrect ? "Đúng" : "Sai") : "Bỏ trống"}
                </span>
              </div>
              <div className="space-y-2">
                {q.options.map((opt, id) => {
                  const isUserAnswer = answer?.selectedAnswer === id;
                  const isRightAnswer = q.correctAnswer === id;

                  return (
                    <div
                      key={id}
                      className={cn(
                        "p-2 rounded-md border flex items-center gap-2",
                        isRightAnswer && "border-green-600 bg-green-50",
                        isUserAnswer &&
                          !isRightAnswer &&
                          "border-red-600 bg-red-50"
                      )}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          isRightAnswer
                            ? "bg-green-600"
                            : isUserAnswer
                            ? "bg-red-600"
                            : "bg-gray-300"
                        )}
                      ></div>
                      <span>{opt}</span>
                      {isRightAnswer && (
                        <span className="ml-auto text-xs text-green-700 font-medium">
                          Đáp án đúng
                        </span>
                      )}
                      {isUserAnswer && !isRightAnswer && (
                        <span className="ml-auto text-xs text-red-700 font-medium">
                          Bạn chọn
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="pt-3">
                <strong>Giải thích: </strong>
                {loadingExplanations && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 ml-6 mt-3"></div>
                )}
                {!loadingExplanations && explanation && (
                  <div className="mt-3 ml-6">{explanation}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentQuizResult;

import React from "react";
import { Card } from "../ui/Card";
import { BarChart3 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchProgress } from "../../redux/action/courseActions";

const ProgressTab = () => {
  const { selectedCourse, progress } = useSelector((state) => state.courses);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProgress(selectedCourse));
  }, [dispatch]);

  const progressItems = [
    {
      label: "Bài tập đã hoàn thành",
      value: progress?.assignmentSubmitted,
      total: progress?.totalAssignments,
      percentage: Number(progress?.assignmentProgress).toFixed(2),
    },
    {
      label: "Bài kiểm tra đã hoàn thành",
      value: progress?.quizTaken,
      total: progress?.totalQuizzes,
      percentage: Number(progress?.quizProgress).toFixed(2),
    },
    {
      label: "Điểm danh lớp học",
      value: progress?.scheduleAttended,
      total: progress?.totalSchedules,
      percentage: Number(progress?.attendanceProgress).toFixed(2),
    },
    {
      label: "Tiến độ chung",
      value: Number(progress?.totalProgress).toFixed(2),
      total: 100,
      percentage: Number(progress?.totalProgress).toFixed(2),
    },
  ];

  return (
    <div className="space-y-6">
      {progressItems.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-foreground text-lg">
              {item.label}
            </h3>
            <span className="text-sm font-semibold text-primary">
              {item.percentage}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {item.value} of {item.total} completed
          </p>
        </div>
      ))}

      <Card className="p-4 bg-accent/30 border-accent">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              Điểm khóa học
            </h4>
            <p className="text-2xl font-bold text-primary mb-3">
              A ({Number(progress?.totalProgress).toFixed(2)}%)
            </p>

            <div className="mb-3">
              <p className="m-0 font-semibold">Cơ sở tính điểm khóa học:</p>
              <div className="flex gap-2 items-center pl-5">
                <div>
                  <p className="m-0">Câu đố</p>
                  <span>30%</span>
                </div>
                <div>
                  <p className="m-0">Bài tập</p>
                  <span>50%</span>
                </div>
                <div>
                  <p className="m-0">Điểm danh</p>
                  <span>20%</span>
                </div>
              </div>
            </div>

            {Number(progress?.totalProgress).toFixed(2) < 50 ? (
              <p className="text-sm text-muted-foreground">
                Hãy nỗ lực để hoàn thành khóa học nhé!
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Bạn làm rất tốt! Hãy tiếp tục phát huy nhé.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgressTab;

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import Progress from "../ui/Progress";
import { selectCourse } from "../../redux/action/courseActions";
import { useDispatch } from "react-redux";

const CourseCard = ({ course }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleEnter = () => {
    dispatch(selectCourse(course.id));
    navigate(`/user/my-courses/${course.id}`);
  };
  return (
    <Card className="h-full hover:shadow-lg hover-scale-103 transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-3">
        <h3
          className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors"
          onClick={handleEnter}
        >
          {course?.subject?.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          Gia sư: {course?.tutor?.name}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Tiến độ</span>
            <span className="text-sm font-semibold text-primary">
              {course?.progress}%
            </span>
          </div>
          <Progress value={course?.progress} className="h-2" />
        </div>

        <div className="bg-accent/50 rounded-md pt-2">
          <p className="text-sm text-foreground m-0 ">
            Bài tập sắp đến hạn (trong 3 ngày):
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs m-0">Trắc nghiệm:</p>
            {course?.dueSoonTasks?.quizzes?.length > 0 ? (
              <p className="text-sm text-primary m-0">
                {course?.dueSoonTasks?.quizzes?.length}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground m-0">0</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs m-0 ">Tự luận:</p>
            {course?.dueSoonTasks?.assignments?.length > 0 ? (
              <p className="text-sm text-primary m-0">
                {course?.dueSoonTasks?.assignments?.length}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground m-0">0</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleEnter}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-white"
        >
          Truy cập khóa học
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseCard;

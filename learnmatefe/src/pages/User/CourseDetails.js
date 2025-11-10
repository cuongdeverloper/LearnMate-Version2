import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
} from "lucide-react";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs";

import AssignmentsTab from "../../components/User/AssignmentsTab";
import QuizzesTab from "../../components/User/QuizzesTab";
import ProgressTab from "../../components/User/ProgressTab";
import CourseSchedule from "../../components/User/CourseSchedule";
import { useSelector } from "react-redux";

const CourseDetails = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const { myCourses, selectedCourse, loading, error } = useSelector(
    (state) => state.courses
  );

  const course = myCourses.find((course) => course.id === selectedCourse);

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/user/my-courses")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại các khóa học
          </Button>
          <div className="bg-card border border-border rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Khóa học không tìm thấy
            </h1>
            <p className="text-muted-foreground mb-6">
              Khóa học bạn đang tìm kiếm không tồn tại.
            </p>
            <Button
              onClick={() => navigate("/user/my-courses")}
              variant="default"
            >
              Quay lại Khóa học
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/user/my-courses")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại các khóa học
        </Button>
        <div className="bg-card border border-border rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {course?.subject?.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Gia sư:{" "}
            <span className=" text-foreground">{course?.tutor?.name}</span>
          </p>
          <p className="text-foreground">Môn học: {course?.subject?.name}</p>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
              <TabsTrigger
                value="schedule"
                className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Lịch học</span>
              </TabsTrigger>
              <TabsTrigger
                value="assignments"
                className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Bài tập</span>
              </TabsTrigger>
              <TabsTrigger
                value="quizzes"
                className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Câu đố</span>
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Tiến độ</span>
              </TabsTrigger>
            </TabsList>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="mt-6">
              <CourseSchedule />
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="mt-6">
              <AssignmentsTab courseTitle={selectedCourse?.subjectId?.name} />
            </TabsContent>

            {/* Quizzes Tab */}
            <TabsContent value="quizzes" className="mt-6">
              <QuizzesTab />
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="mt-6">
              <ProgressTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;

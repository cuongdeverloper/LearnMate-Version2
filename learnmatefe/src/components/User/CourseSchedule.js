import React, { useEffect, useMemo, useState } from "react";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TaskDetailModal from "./TaskDetailModal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssignments,
  fetchQuizzes,
  fetchSchedule,
} from "../../redux/action/courseActions";

export const TASK_COLORS = {
  assignment: "bg-red-100 border-red-300 text-red-900",
  quiz: "bg-green-100 border-green-300 text-green-900",
};

export const TASK_LABELS = {
  assignment: "Assignment",
  quiz: "Quiz",
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const getTasksList = (assignments = [], quizzes = []) => {
  const tasks = [
    ...assignments?.map((a) => ({
      id: a._id,
      title: a.title,
      type: "assignment",
      openTime: a.openTime,
      deadline: a.deadline,
      description: a.description,
      createdAt: a.createdAt,
    })),
    ...quizzes.map((q) => ({
      id: q._id,
      title: q.title,
      type: "quiz",
      openTime: q.openTime,
      deadline: q.closeTime,
      description: q.description,
      createdAt: q.createdAt,
    })),
  ];
  return tasks;
};

const CourseSchedule = () => {
  const dispatch = useDispatch();

  const {
    myCourses = [],
    selectedCourse,
    quizzes = [],
    assignments = [],
    schedule = [],
    loading: error,
  } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchAssignments(selectedCourse));
    dispatch(fetchQuizzes(selectedCourse));
    dispatch(fetchSchedule(selectedCourse));
  }, [dispatch, selectedCourse]);
  useEffect(() => {
    setTasks(getTasksList(assignments, quizzes));
  }, [assignments, quizzes]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tasks, setTasks] = useState(getTasksList(assignments, quizzes));

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDayOfMonth, daysInMonth]);

  const getTasksForDate = (day) => {
    return tasks.filter((t) => {
      return (
        new Date(t.deadline).getDate() === day &&
        new Date(t.deadline).getMonth() === currentDate.getMonth() &&
        new Date(t.deadline).getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const hasClassOnDate = (day) => {
    return schedule.some((s) => {
      return (
        new Date(s.date).getDate() === day &&
        new Date(s.date).getMonth() === currentDate.getMonth() &&
        new Date(s.date).getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const upcomingTasksRaw = myCourses.filter((c) => c.id === selectedCourse)[0]
    .upcomingTasks;

  const upcomingTasks = getTasksList(
    upcomingTasksRaw?.assignments,
    upcomingTasksRaw?.quizzes
  );

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4 text-lg">
              📅 Nhiệm vụ sắp đến (chưa mở)
            </h3>
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => {
                  const taskColor = TASK_COLORS[task.type];
                  return (
                    <button
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className={`w-full p-2 rounded-md border-l-4 hover:bg-accent transition-colors text-left ${taskColor}`}
                    >
                      <p className="text-sm font-medium line-clamp-1 m-0">
                        {task.title}
                      </p>
                      <p className="text-xs opacity-75 m-0">
                        Mở lúc: {formatDate(task.openTime)}
                      </p>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Không có nhiệm vụ sắp đến nào.
                </p>
              )}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {monthName}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={previousMonth}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {[
                "Chủ nhật",
                "Thứ 2",
                "Thứ 3",
                "Thứ 4",
                "Thứ 5",
                "Thứ 6",
                "Thứ 7",
              ].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dateTasks = day ? getTasksForDate(day) : [];
                const hasClass = day ? hasClassOnDate(day) : false;
                const isToday =
                  day &&
                  new Date().getDate() === day &&
                  new Date().getMonth() === currentDate.getMonth() &&
                  new Date().getFullYear() === currentDate.getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border rounded-lg ${
                      day
                        ? isToday
                          ? "bg-primary/10 border-primary"
                          : "bg-background hover:bg-accent/50"
                        : "bg-muted/30"
                    } ${day && hasClass ? "bg-green-200" : ""}`}
                  >
                    {day && (
                      <>
                        <p
                          className={`text-sm font-semibold mb-1 ${
                            isToday ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {day}
                        </p>
                        <div className="space-y-1">
                          {dateTasks.slice(0, 2).map((task) => {
                            const taskColor = TASK_COLORS[task.type];
                            return (
                              <button
                                key={task.id}
                                onClick={() => handleTaskClick(task)}
                                className={`w-full text-xs px-1.5 py-1 rounded border truncate hover:shadow-md transition-shadow ${taskColor}`}
                                title={task.title}
                              >
                                {task.title}
                              </button>
                            );
                          })}
                          {dateTasks.length > 2 && (
                            <p className="text-xs text-muted-foreground px-1.5">
                              +{tasks.length - 2} more
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        courseId={selectedCourse}
      />
    </div>
  );
};

export default CourseSchedule;

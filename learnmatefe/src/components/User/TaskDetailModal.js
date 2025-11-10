import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Calendar, FileText, MapPin } from "lucide-react";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { selectAssignment, selectQuiz } from "../../redux/action/courseActions";

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

const TaskDetailModal = ({ task, isOpen, onClose, courseId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!task) return null;
  const taskColor = TASK_COLORS[task.type];
  const taskLabel = TASK_LABELS[task.type];

  const dateStr = formatDate(task.deadline);

  const handleOpenAssignment = (task) => {
    onClose();
    dispatch(selectAssignment(task.id));
    navigate(`/user/assignments/${task.id}/submit`);
  };
  const handleOpenQuiz = (task) => {
    onClose();
    dispatch(selectQuiz(task.id));
    navigate(`/user/quizzes/${task.id}/take`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col items-start">
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${taskColor}`}
              >
                {taskLabel}
              </div>
              <DialogTitle className="text-2xl">{task.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-foreground">
            <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="font-medium m-0">{dateStr}</p>
              <p className="text-sm text-muted-foreground m-0">
                {formatDate(task.createdAt)}
                {task.deadline && ` - ${formatDate(task.deadline)}`}
              </p>
            </div>
          </div>

          {task.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-foreground">{task.description}</p>
            </div>
          )}

          <div className="pt-4 border-t flex gap-2 justify-end">
            {task.type === "assignment" && (
              <Button
                className=" text-white"
                variant="default"
                onClick={() => {
                  handleOpenAssignment(task);
                }}
              >
                Open Assignment
              </Button>
            )}
            {task.type === "quiz" && (
              <Button
                className=" text-white"
                variant="default"
                onClick={() => {
                  handleOpenQuiz(task);
                }}
              >
                Open Quiz
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;

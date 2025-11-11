import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Menu, TimerIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { RadioGroup, RadioGroupItem } from "../../components/ui/RadioGroup";
import Progress from "../../components/ui/Progress";

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

import { Label } from "../../components/ui/Label";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchQuizDetailsById,
  submitQuiz,
} from "../../redux/action/courseActions";
import { useCallback } from "react";

const formatTime = (sec) => {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${m}:${s}`;
};

const StudentQuizTake = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storageKey = `quiz-${id}-state`;
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    return {
      currentIndex: 0,
      answers: {},
      timer: quizDetails?.duration || 1800,
      startedAt: Date.now(),
    };
  });
  const {
    selectedCourse,
    selectedQuiz,
    quizDetails,
    loading,
    error,
  } = useSelector((state) => state.courses);

  useEffect(() => {
    if (id) dispatch(fetchQuizDetailsById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!quizDetails) return;

    const now = new Date();
    const openTime = quizDetails.openTime ? new Date(quizDetails.openTime) : null;
    const closeTime = quizDetails.closeTime ? new Date(quizDetails.closeTime) : null;

    if (openTime && now < openTime) {
      toast.warning("Quiz has not opened yet!");
      navigate(`/user/my-courses/${selectedCourse}`);
      return;
    }

    if (closeTime && now > closeTime) {
      toast.error("This quiz is already closed.");
      navigate(`/user/my-courses/${selectedCourse}`);
      return;
    }
  }, [quizDetails, navigate, selectedCourse]);
const handleSubmit = useCallback(async (fromAuto = false) => {
    if (!fromAuto) {
      setConfirmOpen(true);
      return;
    }

    const startedAt = state.startedAt;
    const finishedAt = startedAt + (quizDetails.duration - state.timer) * 1000;
    try {
      dispatch(submitQuiz(selectedQuiz, state.answers, startedAt, finishedAt));
      if (!error) {
        localStorage.removeItem(storageKey);
        setState((s) => ({ currentIndex: 0, answers: {}, timer: 30 * 60 }));
        toast.success("Submitted successfully!");
        navigate(`/user/quizzes/${selectedQuiz}/result`);
      } else {
        toast.error(error);
      }
    } catch (e) {
      toast.error(e.message);
    }
  }, [state, quizDetails, selectedQuiz, dispatch, navigate, error, storageKey]);
  
  

  const [confirmOpen, setConfirmOpen] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!state.submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [state.submitted]);

  useEffect(() => {
    if (state.timer <= 0) {
      handleSubmit(true);
      return;
    }
    timerRef.current = window.setInterval(() => {
      setState((s) => ({ ...s, timer: s.timer - 1 }));
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [state.timer, handleSubmit]);

  const currentQuestion = useMemo(
    () => quizDetails?.questions[state.currentIndex],
    [state.currentIndex, quizDetails?.questions]
  );

  const answeredCount = Object.values(state.answers).filter(Boolean).length;

  const selectAnswer = async (qid, value) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [qid]: value } }));

    try {
    } catch (e) { }
  };

  

  if (loading || !quizDetails) {
    return <div className="p-6 text-center">Loading quiz details...</div>;
  }
  return (

    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="sticky top-16 z-30 border-b bg-gray-50/95 backdrop-blur">
          <div className="container py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-semibold text-lg truncate">
                {quizDetails?.title}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-40 hidden sm:block">
                  <Progress
                    value={
                      (answeredCount / quizDetails?.questions?.length) * 100
                    }
                    className="h-1"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {answeredCount}/{quizDetails?.questions?.length} questions
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="sm:hidden inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
                <Menu className="h-4 w-4" /> Questions
              </button>
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  state.timer <= 60
                    ? "bg-red-50 text-red-700 animate-pulse"
                    : state.timer <= 300
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-emerald-50 text-emerald-700"
                )}
              >
                <TimerIcon className="h-4 w-4" />
                <span>{formatTime(state.timer)}</span>
              </div>
              <Button
                className="text-white"
                onClick={() => handleSubmit(false)}
              >
                Submit Quiz
              </Button>
            </div>
          </div>
        </div>
        <div className="m-3">{quizDetails?.description}</div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-6">
              <div className="text-lg font-medium mb-4">
                {currentQuestion?.text}
              </div>
              <RadioGroup
                value={state.answers[currentQuestion?._id]?.toString() || ""}
                onValueChange={(v) => selectAnswer(currentQuestion?._id, v)}
                className="space-y-3"
              >
                {currentQuestion?.options.map((opt, id) => (
                  <div
                    key={id}
                    className={cn(
                      "flex items-center gap-3 rounded-md border p-3",
                      state.answers[currentQuestion?._id] === id &&
                      "border-primary bg-blue-500/5 text-primary"
                    )}
                  >
                    <RadioGroupItem
                      value={id.toString()}
                      id={`opt-${currentQuestion._id}-${id}`}
                    />
                    <Label
                      htmlFor={`opt-${currentQuestion._id}-${id}`}
                      className="cursor-pointer"
                    >
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </Card>

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                disabled={state.currentIndex === 0}
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    currentIndex: Math.max(0, s.currentIndex - 1),
                  }))
                }
              >
                Previous
              </Button>
              <Button
                disabled={
                  state?.currentIndex === quizDetails?.questions?.length - 1
                }
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    currentIndex: Math.min(
                      s.currentIndex + 1,
                      quizDetails.questions.length - 1
                    ),
                  }))
                }
                className="text-white"
              >
                Next
              </Button>
            </div>
          </div>
          <aside className="lg:col-span-1">
            <Card className="p-4 w-full max-w-[240px] lg:max-w-none">
              <h3 className="font-semibold mb-3 text-xl">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {quizDetails?.questions.map((q, idx) => {
                  const answered = state.answers[q._id] !== undefined;
                  const isCurrent = idx === state.currentIndex;
                  return (
                    <button
                      key={q._id}
                      onClick={() =>
                        setState((s) => ({ ...s, currentIndex: idx }))
                      }
                      className={cn(
                        "relative h-9 rounded-md border text-sm font-medium",
                        isCurrent && "border-2 border-yellow-500",
                        answered
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      )}
                      title={`Go to question ${idx + 1}`}
                    >
                      {answered && (
                        <Check className="absolute -right-1 -top-1 h-4 w-4" />
                      )}
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </Card>
          </aside>
        </div>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                You have answered {answeredCount} of{" "}
                {quizDetails?.questions.length} questions. Once submitted, you
                cannot change your answers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-600 text-white"
                onClick={() => handleSubmit(true)}
              >
                Submit Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default StudentQuizTake;

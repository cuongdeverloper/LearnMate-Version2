import React, { useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, CheckCircle2, Download, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { formatDate } from "../../lib/utils";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssignments } from "../../redux/action/courseActions";

const getFileType = (url) => {
  if (url.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  if (url.toLowerCase().endsWith(".docx")) {
    return "docx";
  }
  return "unknown";
};

const getFileName = (url = "") => {
  try {
    const cleanUrl = url.split("?")[0];
    const rawName = cleanUrl.split("/").pop() || "assignment";

    let decoded = "";
    try {
      decoded = decodeURIComponent(rawName);
    } catch {
      decoded = rawName;
    }

    const fixed = new TextDecoder("utf-8").decode(
      new Uint8Array([...decoded].map((c) => c.charCodeAt(0)))
    );

    return fixed || "assignment";
  } catch {
    return "assignment";
  }
};

const ViewAssignmentFeedback = () => {
  const navigate = useNavigate();
  const { id: assignmentId } = useParams();
  const dispatch = useDispatch();

  const {
    selectedCourse,

    assignments,
    selectedAssignment,

    submitting,
    loading,
    error,
  } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchAssignments(selectedCourse));
  }, [dispatch, selectedAssignment, submitting]);

  const assignment = assignments.find((a) => a._id === selectedAssignment);

  if (!selectedAssignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(`/user/my-courses/${selectedCourse}`)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Trở lại
          </Button>
          <div className="bg-card border border-border rounded-lg shadow-sm p-8 text-center">
            <p className="text-foreground mb-4">Không tìm thấy bài tập</p>
            <Button
              onClick={() => navigate(`/user/my-courses/${selectedCourse}`)}
              className="text-white "
            >
              Quay trở lại khóa học
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment?.grade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(`/user/my-courses/${selectedCourse}`)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Trở lại
          </Button>
          <div className="bg-card border border-border rounded-lg shadow-sm p-8 relative">
            <Button
              onClick={() =>
                navigate(`/user/assignments/${selectedAssignment}/submit`)
              }
              className="text-white absolute top-2 right-2"
            >
              Nộp lại
            </Button>
            <p className="text-lg text-muted-foreground mb-8">
              {assignment?.title}
            </p>

            <div className="space-y-6">
              <div className="border border-border rounded-lg p-3 bg-muted/30 ">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Mô tả
                </h3>
                <p className="text-foreground bg-muted/30 p-2 rounded-lg">
                  {assignment?.description}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Ngày hết hạn
                </h3>
                <p>{formatDate(assignment?.deadline, "yyyy-MM-dd")}</p>
              </div>

              {assignment?.fileUrl && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    File bài tập
                  </h3>
                  {getFileType(assignment?.fileUrl) === "pdf" ? (
                    <div className="border border-border rounded-lg overflow-hidden bg-white">
                      <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium text-foreground">
                            {getFileName(assignment?.fileUrl)}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = assignment?.fileUrl;
                            link.download = getFileName(assignment?.fileUrl);
                            link.click();
                          }}
                          className="gap-2 text-white"
                        >
                          <Download className="w-4 h-4" />
                          Tải xuống
                        </Button>
                      </div>
                      <iframe
                        src={`${assignment?.fileUrl}#toolbar=0`}
                        className="w-full h-96 border-none"
                        title="Assignment PDF"
                      />
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg p-4 bg-muted/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-medium text-foreground">
                            {getFileName(assignment?.fileUrl)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            DOCX file - Download to view
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = assignment?.fileUrl;
                          link.download = getFileName(assignment?.fileUrl);
                          link.click();
                        }}
                        className="gap-2 text-white"
                      >
                        <Download className="w-4 h-4 text-white" />
                        Tải xuống
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {assignment?.submitFileUrl && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    File đã nộp
                  </h3>
                  {getFileType(assignment?.submitFileUrl) === "pdf" ? (
                    <div className="border border-border rounded-lg overflow-hidden bg-white">
                      <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium text-foreground">
                            {getFileName(assignment?.submitFileUrl)}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = assignment?.submitFileUrl;
                            link.download = getFileName(
                              assignment?.submitFileUrl
                            );
                            link.click();
                          }}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Tải xuống
                        </Button>
                      </div>
                      <iframe
                        src={`${assignment?.submitFileUrl}#toolbar=0`}
                        className="w-full h-96 border-none"
                        title="Assignment PDF"
                      />
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg p-4 bg-muted/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-medium text-foreground">
                            {getFileName(assignment?.submitFileUrl)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            DOCX file - Download to view
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = assignment?.submitFileUrl;
                          link.download = getFileName(
                            assignment?.submitFileUrl
                          );
                          link.click();
                        }}
                        className="gap-2 text-white"
                      >
                        <Download className="w-4 h-4 text-white" />
                        Tải xuống
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const radarData = assignment.rubric
    ? assignment.rubric.map((criteria) => ({
        name: criteria.name,
        score: (criteria.score / criteria.maxScore) * 100,
        fullMark: 100,
      }))
    : [];

  const gradePercentage = assignment.grade
    ? (assignment.grade / (assignment.maxGrade || 10)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(`/user/my-courses/${selectedCourse}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại khóa học
        </Button>
        <Card className="p-8 mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">Phản hồi</h1>
          <p>{assignment.title}</p>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Điểm của bạn
            </h3>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">
                {assignment.grade}/{assignment.maxGrade || 10}
              </p>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${gradePercentage}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {gradePercentage.toFixed(1)}%
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-green-50/30 border-green-200">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Trạng thái
            </h3>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold text-green-900">
                Đã chấm
              </span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Đã nộp
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {assignment.submittedAt
                ? formatDate(assignment.submittedAt)
                : "N/A"}
            </p>
          </Card>
        </div>
        <Card className="p-8 mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Teacher Feedback
          </h3>
          <div className="bg-muted/30 p-6 rounded-lg border border-border">
            <p className="text-foreground leading-relaxed">
              {assignment?.feedback}
            </p>
          </div>
        </Card>

        {radarData.length > 0 && (
          <Card className="p-8 mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Rubric Breakdown
            </h3>
            <div className="flex justify-center w-full">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart
                  data={radarData}
                  margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
                >
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#7c3aed"
                    fill="#7c3aed"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 space-y-2">
              <h4 className="font-semibold text-foreground mb-4">
                Detailed Scores
              </h4>
              {assignment.rubric &&
                assignment.rubric.map((criteria) => (
                  <div
                    key={criteria.name}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <span className="font-medium text-foreground">
                      {criteria.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${
                              (criteria.score / criteria.maxScore) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-primary w-12 text-right">
                        {criteria.score}/{criteria.maxScore}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
        <Card className="p-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Bài nộp của bạn
          </h3>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              const link = document.createElement("a");
              link.href = assignment?.submitFileUrl;
              link.download = getFileName(assignment?.submitFileUrl);
              link.click();
            }}
            className="gap-2 text-white"
          >
            <Download className="w-4 h-4 text-white" />
            Tải xuống bài nộp của bạn
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ViewAssignmentFeedback;

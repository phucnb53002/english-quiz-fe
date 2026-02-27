"use client";

import { useState, useEffect } from "react";
import { Trophy, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { resultsApi, testsApi, examsApi } from "@/lib/api-routes";
import { Result, Question, Exam } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

export default function HistoryPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<{
    totalSubmissions: number;
    averageScore: number;
    bestScore: number;
    recentResults: Result[];
  }>({
    totalSubmissions: 0,
    averageScore: 0,
    bestScore: 0,
    recentResults: [],
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<{ [key: string]: Exam }>({}); // Map examId -> Exam
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyData, statsData, questionsData] = await Promise.all([
          resultsApi.getMyHistory(),
          resultsApi.getMyStats(),
          testsApi.getAll().catch(() => []),
        ]);
        setResults(historyData);
        setStats(statsData);
        setQuestions(questionsData);

        const examIds = Array.from(
          new Set(questionsData.map((q: Question) => q.examId).filter(Boolean))
        );

        if (examIds.length > 0) {
          const examsMap: { [key: string]: Exam } = {};
          await Promise.all(
            examIds.map(async (examId) => {
              try {
                const examData = await examsApi.getOne(examId as string);
                examsMap[examId as string] = examData.exam;
              } catch (err) {
                console.error(`Failed to fetch exam ${examId}:`, err);
              }
            })
          );
          setExams(examsMap);
        }
      } catch {
        addToast("Không thể tải lịch sử thi", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return "#22c55e";
    if (percentage >= 40) return "#eab308";
    return "#ef4444";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getQuestionContent = (questionId: string) => {
    const question = questions.find((q) => q._id === questionId);
    return question?.content || "Câu hỏi đã bị xóa";
  };

  const getExamTitle = (): string => {
    if (!selectedResult || selectedResult.results.length === 0) return "";

    const firstQuestionId = selectedResult.results[0].questionId;
    const firstQuestion = questions.find((q) => q._id === firstQuestionId);

    if (!firstQuestion || !firstQuestion.examId) return "";

    return exams[firstQuestion.examId]?.title || "";
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
          }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#111827" }}>
          Lịch sử thi
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
          Xem lại lịch sử làm bài thi của bạn
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy style={{ width: "24px", height: "24px", color: "white" }} />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "#6b7280" }}>Số lần thi</p>
            <p
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {stats.totalSubmissions}
            </p>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle
              style={{ width: "24px", height: "24px", color: "white" }}
            />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              Điểm trung bình
            </p>
            <p
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {stats.averageScore}%
            </p>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy style={{ width: "24px", height: "24px", color: "white" }} />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "#6b7280" }}>Điểm cao nhất</p>
            <p
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {stats.bestScore}%
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
            Lịch sử làm bài
          </h2>
        </div>

        {results.length === 0 ? (
          <div
            style={{ padding: "48px", textAlign: "center", color: "#9ca3af" }}
          >
            Bạn chưa làm bài thi nào
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th
                    style={{
                      padding: "14px 24px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    Ngày thi
                  </th>
                  <th
                    style={{
                      padding: "14px 24px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    Số câu đúng
                  </th>
                  <th
                    style={{
                      padding: "14px 24px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    Điểm số
                  </th>
                  <th
                    style={{
                      padding: "14px 24px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    Thời gian
                  </th>
                  <th
                    style={{
                      padding: "14px 24px",
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={result._id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      background: index % 2 === 0 ? "white" : "#f9fafb",
                    }}
                  >
                    <td
                      style={{
                        padding: "16px 24px",
                        color: "#374151",
                        fontSize: "14px",
                      }}
                    >
                      {new Date(result.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ fontWeight: 600, color: "#22c55e" }}>
                        {result.score}
                      </span>
                      <span style={{ color: "#9ca3af" }}>/{result.total}</span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "14px",
                          fontWeight: 600,
                          background: `${getScoreColor(result.percentage)}20`,
                          color: getScoreColor(result.percentage),
                        }}
                      >
                        {result.percentage}%
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "16px 24px",
                        color: "#6b7280",
                        fontSize: "14px",
                      }}
                    >
                      <Clock
                        style={{
                          width: "16px",
                          height: "16px",
                          display: "inline",
                          marginRight: "4px",
                        }}
                      />
                      {formatTime(result.timeSpent)}
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      <button
                        onClick={() => setSelectedResult(result)}
                        style={{
                          padding: "8px 16px",
                          background: "#f3f4f6",
                          color: "#374151",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Eye style={{ width: "16px", height: "16px" }} />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 50,
          }}
          onClick={() => setSelectedResult(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Chi tiết kết quả
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  {getExamTitle() && (
                    <>
                      <strong>{getExamTitle()}</strong> •{" "}
                    </>
                  )}
                  {new Date(selectedResult.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f3f4f6",
                  color: "#6b7280",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "24px",
                  marginBottom: "24px",
                  padding: "20px",
                  background: "#f9fafb",
                  borderRadius: "12px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>Điểm số</p>
                  <p
                    style={{
                      fontSize: "32px",
                      fontWeight: 700,
                      color: getScoreColor(selectedResult.percentage),
                    }}
                  >
                    {selectedResult.percentage}%
                  </p>
                </div>
                <div
                  style={{
                    width: "1px",
                    height: "50px",
                    background: "#e5e7eb",
                  }}
                ></div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>
                    Số câu đúng
                  </p>
                  <p
                    style={{
                      fontSize: "32px",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {selectedResult.score}/{selectedResult.total}
                  </p>
                </div>
                <div
                  style={{
                    width: "1px",
                    height: "50px",
                    background: "#e5e7eb",
                  }}
                ></div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>
                    Thời gian
                  </p>
                  <p
                    style={{
                      fontSize: "32px",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {Math.floor(selectedResult.timeSpent / 60)}:
                    {(selectedResult.timeSpent % 60)
                      .toString()
                      .padStart(2, "0")}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {selectedResult.results.map((item, index) => {
                  console.log("results", results);

                  console.log("item.questionId:", item.questionId);

                  const questionContent = getQuestionContent(item.questionId);
                  return (
                    <div
                      key={item.questionId}
                      style={{
                        background: item.correct ? "#f0fdf4" : "#fef2f2",
                        borderRadius: "12px",
                        padding: "16px",
                        borderLeft: `4px solid ${
                          item.correct ? "#22c55e" : "#ef4444"
                        }`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        {item.correct ? (
                          <CheckCircle
                            style={{
                              width: "20px",
                              height: "20px",
                              color: "#22c55e",
                              flexShrink: 0,
                              marginTop: "2px",
                            }}
                          />
                        ) : (
                          <XCircle
                            style={{
                              width: "20px",
                              height: "20px",
                              color: "#ef4444",
                              flexShrink: 0,
                              marginTop: "2px",
                            }}
                          />
                        )}
                        <div>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: item.correct ? "#166534" : "#991b1b",
                              marginBottom: "4px",
                            }}
                          >
                            Câu {index + 1}: {item.correct ? "Đúng" : "Sai"}
                          </p>
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#374151",
                              lineHeight: 1.5,
                            }}
                          >
                            {questionContent}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Edit,
} from "lucide-react";
import { testsApi, examsApi } from "@/lib/api-routes";
import { Question, User, Exam } from "@/types";
import { useToast } from "@/components/ToastProvider";

interface QuestionFormData {
  examId: string;
  content: string;
  options: string[];
  correctAnswer: number;
  level: "easy" | "medium" | "hard";
}

const initialFormState: QuestionFormData = {
  examId: "",
  content: "",
  options: ["", ""],
  correctAnswer: 0,
  level: "easy",
};

export default function TestsPage() {
  const [exams, setExams] = useState<
    (Exam & { questionCount: number; questions?: Question[] })[]
  >([]);
  const [expandedExams, setExpandedExams] = useState<Record<string, boolean>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    question: Question;
    examId: string;
  } | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<QuestionFormData>(initialFormState);
  const [optionList, setOptionList] = useState<string[]>(["", ""]);

  const { addToast } = useToast();

  const fetchExams = async () => {
    try {
      const data = await examsApi.getAll();
      setExams(data.map((exam) => ({ ...exam, questions: [] })));
    } catch {
      addToast("Không thể tải danh sách bài thi", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestionsForExam = async (examId: string) => {
    try {
      const data = await examsApi.getOne(examId);
      setExams((prev) =>
        prev.map((exam) =>
          exam._id === examId ? { ...exam, questions: data.questions } : exam
        )
      );
    } catch {
      addToast("Không thể tải câu hỏi", "error");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchExams();
  }, []);

  const toggleExam = (examId: string) => {
    setExpandedExams((prev) => {
      const newState = { ...prev };
      if (newState[examId]) {
        delete newState[examId];
      } else {
        newState[examId] = true;
        fetchQuestionsForExam(examId);
      }
      return newState;
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.examId) {
      errors.examId = "Vui lòng chọn bài thi";
    }

    if (!formData.content || formData.content.length < 10) {
      errors.content = "Câu hỏi phải có ít nhất 10 ký tự";
    }

    const validOptions = optionList.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      errors.options = "Cần ít nhất 2 đáp án";
    }

    if (
      formData.correctAnswer < 0 ||
      formData.correctAnswer >= validOptions.length
    ) {
      errors.correctAnswer = "Vui lòng chọn đáp án đúng hợp lệ";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateModal = (examId?: string) => {
    setEditingQuestion(null);
    setFormData({ ...initialFormState, examId: examId || "" });
    setOptionList(["", ""]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      examId: question.examId || "",
      content: question.content,
      options: question.options,
      correctAnswer: question.correctAnswer,
      level: question.level,
    });
    setOptionList(question.options);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
    setFormData(initialFormState);
    setOptionList(["", ""]);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      options: optionList,
    };

    setIsSubmitting(true);
    try {
      if (editingQuestion) {
        await testsApi.update(editingQuestion._id, submitData);
        addToast("Cập nhật câu hỏi thành công", "success");
      } else {
        await testsApi.create(submitData);
        addToast("Tạo câu hỏi thành công", "success");
      }
      closeModal();
      fetchQuestionsForExam(formData.examId);
      fetchExams();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast(err.response?.data?.message || "Thao tác thất bại", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await testsApi.delete(deleteConfirm.question._id);
      addToast("Xóa câu hỏi thành công", "success");
      setDeleteConfirm(null);
      fetchQuestionsForExam(deleteConfirm.examId);
      fetchExams();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast(err.response?.data?.message || "Xóa thất bại", "error");
    }
  };

  const addOption = () => {
    if (optionList.length < 6) {
      setOptionList([...optionList, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (optionList.length > 2) {
      const newOptions = optionList.filter((_, i) => i !== index);
      setOptionList(newOptions);
      if (formData.correctAnswer >= newOptions.length) {
        setFormData({ ...formData, correctAnswer: newOptions.length - 1 });
      }
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...optionList];
    newOptions[index] = value;
    setOptionList(newOptions);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "easy":
        return { bg: "#dcfce7", color: "#166534" };
      case "medium":
        return { bg: "#fef9c3", color: "#854d0e" };
      case "hard":
        return { bg: "#fee2e2", color: "#991b1b" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  const getFilteredQuestions = (questions: Question[]) => {
    return questions.filter((q) => {
      const matchesSearch =
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.options.some((opt) =>
          opt.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesLevel = levelFilter === "all" || q.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#111827" }}>
          Quản lý câu hỏi thi
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
          Tạo và quản lý câu hỏi trắc nghiệm tiếng Anh theo từng bài thi
        </p>
      </div>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
          }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : exams.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            padding: "48px",
            textAlign: "center",
          }}
        >
          <FolderOpen
            style={{
              width: "64px",
              height: "64px",
              color: "#9ca3af",
              margin: "0 auto 16px",
            }}
          />
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Chưa có bài thi nào
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Vui lòng tạo bài thi trước tại trang Quản lý bài thi
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {exams.map((exam) => {
            const isExpanded = expandedExams[exam._id];
            const filteredQuestions = exam.questions
              ? getFilteredQuestions(exam.questions)
              : [];

            return (
              <div
                key={exam._id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleExam(exam._id)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background:
                          "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <BookOpen
                        style={{
                          width: "22px",
                          height: "22px",
                          color: "white",
                        }}
                      />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#111827",
                        }}
                      >
                        {exam.title}
                      </h3>
                      <p style={{ fontSize: "13px", color: "#6b7280" }}>
                        {exam.questionCount} câu hỏi
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateModal(exam._id);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        background: "#f0fdf4",
                        color: "#16a34a",
                        border: "1px solid #22c55e",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      <Plus style={{ width: "16px", height: "16px" }} />
                      Thêm câu hỏi
                    </button>
                    {isExpanded ? (
                      <ChevronDown
                        style={{
                          width: "20px",
                          height: "20px",
                          color: "#6b7280",
                        }}
                      />
                    ) : (
                      <ChevronRight
                        style={{
                          width: "20px",
                          height: "20px",
                          color: "#6b7280",
                        }}
                      />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid #e5e7eb" }}>
                    {exam.questions && exam.questions.length > 0 ? (
                      filteredQuestions.length > 0 ? (
                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                          {filteredQuestions.map((question, index) => {
                            const levelColor = getLevelColor(question.level);
                            return (
                              <div
                                key={question._id}
                                style={{
                                  padding: "16px 20px",
                                  borderBottom:
                                    index < filteredQuestions.length - 1
                                      ? "1px solid #e5e7eb"
                                      : "none",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "16px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "6px",
                                    background: "#f3f4f6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#6b7280",
                                    flexShrink: 0,
                                  }}
                                >
                                  {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      color: "#374151",
                                      marginBottom: "8px",
                                    }}
                                  >
                                    {question.content}
                                  </p>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "12px",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <div
                                      style={{ display: "flex", gap: "6px" }}
                                    >
                                      {question.options.map((opt, idx) => (
                                        <span
                                          key={idx}
                                          style={{
                                            padding: "4px 10px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            background:
                                              idx === question.correctAnswer
                                                ? "#dcfce7"
                                                : "#f3f4f6",
                                            color:
                                              idx === question.correctAnswer
                                                ? "#166534"
                                                : "#6b7280",
                                          }}
                                        >
                                          {String.fromCharCode(65 + idx)}
                                        </span>
                                      ))}
                                    </div>
                                    <span
                                      style={{
                                        padding: "4px 10px",
                                        borderRadius: "20px",
                                        fontSize: "11px",
                                        fontWeight: 500,
                                        background: levelColor.bg,
                                        color: levelColor.color,
                                      }}
                                    >
                                      {question.level === "easy"
                                        ? "Dễ"
                                        : question.level === "medium"
                                        ? "Trung bình"
                                        : "Khó"}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    onClick={() => openEditModal(question)}
                                    style={{
                                      padding: "8px 12px",
                                      background: "#f3f4f6",
                                      color: "#374151",
                                      border: "none",
                                      borderRadius: "6px",
                                      fontSize: "12px",
                                      fontWeight: 500,
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Edit
                                      style={{ width: "14px", height: "14px" }}
                                    />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteConfirm({
                                        question,
                                        examId: exam._id,
                                      })
                                    }
                                    style={{
                                      padding: "8px 12px",
                                      background: "#fef2f2",
                                      color: "#dc2626",
                                      border: "none",
                                      borderRadius: "6px",
                                      fontSize: "12px",
                                      fontWeight: 500,
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Trash2
                                      style={{ width: "14px", height: "14px" }}
                                    />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "24px",
                            textAlign: "center",
                            color: "#9ca3af",
                          }}
                        >
                          Không tìm thấy câu hỏi phù hợp
                        </div>
                      )
                    ) : (
                      <div style={{ padding: "24px", textAlign: "center" }}>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
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
          onClick={closeModal}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
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
              <h2
                style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}
              >
                {editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
              </h2>
              <button
                onClick={closeModal}
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

            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Bài thi *
                </label>
                <select
                  value={formData.examId}
                  onChange={(e) =>
                    setFormData({ ...formData, examId: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: formErrors.examId ? "#ef4444" : "#d1d5db",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <option value="">-- Chọn bài thi --</option>
                  {exams.map((exam) => (
                    <option key={exam._id} value={exam._id}>
                      {exam.title}
                    </option>
                  ))}
                </select>
                {formErrors.examId && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#ef4444",
                      marginTop: "4px",
                    }}
                  >
                    {formErrors.examId}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Nội dung câu hỏi
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Nhập câu hỏi..."
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: formErrors.content ? "#ef4444" : "#d1d5db",
                    borderRadius: "10px",
                    fontSize: "14px",
                    minHeight: "100px",
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                {formErrors.content && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#ef4444",
                      marginTop: "4px",
                    }}
                  >
                    {formErrors.content}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "12px",
                  }}
                >
                  Các đáp án (chọn đáp án đúng bằng cách bấm vào)
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {optionList.map((option, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, correctAnswer: index })
                        }
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          border: "none",
                          background:
                            formData.correctAnswer === index
                              ? "#dcfce7"
                              : "#f3f4f6",
                          color:
                            formData.correctAnswer === index
                              ? "#16a34a"
                              : "#9ca3af",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {formData.correctAnswer === index ? (
                          <span style={{ color: "#16a34a" }}>✓</span>
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </button>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Đáp án ${String.fromCharCode(
                          65 + index
                        )}`}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          border: "1px solid #d1d5db",
                          borderRadius: "10px",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                      {optionList.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            border: "none",
                            background: "#fef2f2",
                            color: "#dc2626",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Trash2 style={{ width: "18px", height: "18px" }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  disabled={optionList.length >= 6}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "12px",
                    padding: "10px 16px",
                    background: "transparent",
                    color: "#22c55e",
                    border: "1px dashed #22c55e",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: optionList.length >= 6 ? "not-allowed" : "pointer",
                    opacity: optionList.length >= 6 ? 0.5 : 1,
                  }}
                >
                  <Plus style={{ width: "16px", height: "16px" }} />
                  Thêm đáp án
                </button>
                {formErrors.options && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#ef4444",
                      marginTop: "4px",
                    }}
                  >
                    {formErrors.options}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Mức độ
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  {(["easy", "medium", "hard"] as const).map((level) => {
                    const colors = getLevelColor(level);
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, level })}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          borderRadius: "10px",
                          background:
                            formData.level === level ? colors.bg : "#f3f4f6",
                          color:
                            formData.level === level ? colors.color : "#6b7280",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: "pointer",
                          border:
                            formData.level === level
                              ? `2px solid ${colors.color}`
                              : "2px solid transparent",
                        }}
                      >
                        {level === "easy"
                          ? "Dễ"
                          : level === "medium"
                          ? "Trung bình"
                          : "Khó"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  paddingTop: "8px",
                }}
              >
                <button
                  onClick={closeModal}
                  style={{
                    padding: "12px 24px",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    background: isSubmitting
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  )}
                  {editingQuestion ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
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
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "24px", textAlign: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background: "#fef2f2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Trash2
                  style={{ width: "28px", height: "28px", color: "#dc2626" }}
                />
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "8px",
                }}
              >
                Xóa câu hỏi
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "24px",
                }}
              >
                Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể
                hoàn tác.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    padding: "12px 24px",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: "12px 24px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

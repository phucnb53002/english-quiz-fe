'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, BookOpen, Eye, FolderOpen } from 'lucide-react';
import { examsApi, testsApi } from '@/lib/api-routes';
import { Exam, Question } from '@/types';
import { useToast } from '@/components/ToastProvider';

interface ExamFormData {
  title: string;
  description: string;
  isActive: boolean;
}

const initialFormState: ExamFormData = {
  title: '',
  description: '',
  isActive: true,
};

export default function ExamsPage() {
  const [exams, setExams] = useState<(Exam & { questionCount: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Exam | null>(null);
  const [formData, setFormData] = useState<ExamFormData>(initialFormState);
  const [selectedExam, setSelectedExam] = useState<(Exam & { questionCount: number }) | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const { addToast } = useToast();

  const fetchExams = async () => {
    try {
      const data = await examsApi.getAll();
      setExams(data);
    } catch {
      addToast('Không thể tải danh sách bài thi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const openCreateModal = () => {
    setEditingExam(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description || '',
      isActive: exam.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExam(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      addToast('Vui lòng nhập tên bài thi', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingExam) {
        await examsApi.update(editingExam._id, formData);
        addToast('Cập nhật bài thi thành công', 'success');
      } else {
        await examsApi.create(formData);
        addToast('Tạo bài thi thành công', 'success');
      }
      closeModal();
      fetchExams();
    } catch {
      addToast('Thao tác thất bại', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await examsApi.delete(deleteConfirm._id);
      addToast('Xóa bài thi thành công', 'success');
      setDeleteConfirm(null);
      fetchExams();
    } catch {
      addToast('Xóa thất bại', 'error');
    }
  };

  const handleViewQuestions = async (exam: Exam & { questionCount: number }) => {
    setSelectedExam(exam);
    setIsLoadingQuestions(true);
    try {
      const data = await examsApi.getOne(exam._id);
      setExamQuestions(data.questions);
    } catch {
      addToast('Không thể tải câu hỏi', 'error');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>
          Quản lý bài thi
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
          Tạo và quản lý các bài thi tiếng Anh
        </p>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FolderOpen style={{ width: '24px', height: '24px', color: '#22c55e' }} />
            <span style={{ fontSize: '16px', fontWeight: 500, color: '#374151' }}>
              {exams.length} bài thi
            </span>
          </div>
          <button
            onClick={openCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            Tạo bài thi mới
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedExam ? '1fr 1fr' : '1fr', gap: '24px' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb',
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Danh sách bài thi
            </h2>
          </div>

          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : exams.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
              Chưa có bài thi nào
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Tên bài thi</th>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Số câu hỏi</th>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Trạng thái</th>
                    <th style={{ padding: '14px 24px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam, index) => (
                    <tr
                      key={exam._id}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        background: index % 2 === 0 ? 'white' : '#f9fafb',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleViewQuestions(exam)}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <BookOpen style={{ width: '20px', height: '20px', color: 'white' }} />
                          </div>
                          <span style={{ fontWeight: 500, color: '#111827' }}>{exam.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#374151' }}>
                        {exam.questionCount} câu hỏi
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: exam.isActive ? '#dcfce7' : '#fee2e2',
                            color: exam.isActive ? '#166534' : '#991b1b',
                          }}
                        >
                          {exam.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEditModal(exam)}
                            style={{
                              padding: '8px 14px',
                              background: '#f3f4f6',
                              color: '#374151',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            <Edit style={{ width: '16px', height: '16px' }} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(exam)}
                            style={{
                              padding: '8px 14px',
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedExam && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e5e7eb',
                background: '#f9fafb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                Câu hỏi của: {selectedExam.title}
              </h2>
              <button
                onClick={() => setSelectedExam(null)}
                style={{
                  padding: '6px 12px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>

            {isLoadingQuestions ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : examQuestions.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                Chưa có câu hỏi nào trong bài thi này
              </div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {examQuestions.map((question, index) => (
                  <div
                    key={question._id}
                    style={{
                      padding: '16px 24px',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#6b7280',
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                          {question.content}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {question.options.map((opt, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                background: idx === question.correctAnswer ? '#dcfce7' : '#f3f4f6',
                                color: idx === question.correctAnswer ? '#166534' : '#6b7280',
                              }}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 50,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                {editingExam ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  Tên bài thi *
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên bài thi"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  Mô tả
                </label>
                <textarea
                  placeholder="Nhập mô tả (tùy chọn)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Bài thi đang hoạt động</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button
                  onClick={closeModal}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  )}
                  {editingExam ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 50,
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: '#fef2f2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Trash2 style={{ width: '28px', height: '28px', color: '#dc2626' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                Xóa bài thi
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                Bạn có chắc chắn muốn xóa bài thi <strong>{deleteConfirm.title}</strong>? Tất cả câu hỏi trong bài thi này cũng sẽ bị xóa.
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '12px 24px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
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

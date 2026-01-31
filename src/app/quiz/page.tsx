'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy, ArrowRight, Clock, BookOpen, Play } from 'lucide-react';
import { examsApi, resultsApi } from '@/lib/api-routes';
import { QuizQuestion, QuizResult, Exam } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ToastProvider';

interface ExamWithQuestions extends Exam {
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamWithQuestions | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const { user } = useAuth();
  const { addToast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await examsApi.getActive();
        setExams(data);
      } catch {
        addToast('Không thể tải danh sách bài thi', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSelectExam = async (exam: Exam) => {
    setIsLoadingQuestions(true);
    setSelectedExam(null);
    try {
      const data = await examsApi.getQuizQuestions(exam._id);
      setSelectedExam({
        ...exam,
        questions: data,
      });
      setCurrentQuestion(0);
      setAnswers({});
      setTimeSpent(0);
      setStartTime(Date.now());
      
      timerRef.current = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } catch {
      addToast('Không thể tải câu hỏi', 'error');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleBackToExams = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSelectedExam(null);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setShowResult(false);
  };

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedExam) return;

    const answerArray = selectedExam.questions.map((q) => ({
      questionId: q._id,
      answer: answers[q._id] ?? -1,
    }));

    const unansweredCount = answerArray.filter((a) => a.answer === -1).length;
    if (unansweredCount > 0) {
      if (!confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có muốn nộp bài không?`)) {
        return;
      }
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsSubmitting(true);
    try {
      const quizResult = await examsApi.submitQuiz(selectedExam._id, answerArray);
      
      await resultsApi.saveResult({
        userId: user?._id || '',
        userName: user?.name || '',
        score: quizResult.score,
        total: quizResult.total,
        percentage: quizResult.percentage,
        results: quizResult.results,
        timeSpent,
      });

      setResult(quizResult);
      setShowResult(true);
    } catch {
      addToast('Có lỗi xảy ra khi nộp bài', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    if (selectedExam) {
      setAnswers({});
      setCurrentQuestion(0);
      setResult(null);
      setShowResult(false);
      setTimeSpent(0);
      setStartTime(Date.now());
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return '#22c55e';
    if (percentage >= 40) return '#eab308';
    return '#ef4444';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'easy':
        return { bg: '#dcfce7', color: '#166534' };
      case 'medium':
        return { bg: '#fef9c3', color: '#854d0e' };
      case 'hard':
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (showResult && result && selectedExam) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>Kết quả bài thi</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            {selectedExam.title} • {new Date().toLocaleString('vi-VN')}
          </p>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '32px',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `${getScoreColor(result.percentage)}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              border: `4px solid ${getScoreColor(result.percentage)}`,
            }}
          >
            <span style={{ fontSize: '36px', fontWeight: 700, color: getScoreColor(result.percentage) }}>
              {result.percentage}%
            </span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
            {result.percentage >= 70 ? 'Xuất sắc!' : result.percentage >= 40 ? 'Cố gắng hơn nhé!' : 'Cần cải thiện'}
          </h2>

          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
            Bạn trả lời đúng <strong style={{ color: '#22c55e' }}>{result.score}</strong> / <strong>{result.total}</strong> câu hỏi
            <span style={{ marginLeft: '16px' }}>•</span>
            <span style={{ marginLeft: '8px' }}>Thời gian: <strong>{formatTime(timeSpent)}</strong></span>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={handleRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <RotateCcw style={{ width: '20px', height: '20px' }} />
              Làm lại bài thi
            </button>
            <button
              onClick={handleBackToExams}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Chọn bài thi khác
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {result.results.map((item, index) => {
            const question = selectedExam.questions.find((q) => q._id === item.questionId);
            if (!question) return null;

            const levelColor = getLevelColor(question.level);

            return (
              <div
                key={item.questionId}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px 20px',
                    background: item.correct ? '#f0fdf4' : '#fef2f2',
                    borderLeft: `4px solid ${item.correct ? '#22c55e' : '#ef4444'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {item.correct ? (
                    <CheckCircle style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                  ) : (
                    <XCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                  )}
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: item.correct ? '#166534' : '#991b1b',
                    }}
                  >
                    Câu {index + 1}: {item.correct ? 'Đúng' : 'Sai'}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: levelColor.bg,
                      color: levelColor.color,
                    }}
                  >
                    {question.level === 'easy' ? 'Dễ' : question.level === 'medium' ? 'Trung bình' : 'Khó'}
                  </span>
                </div>

                <div style={{ padding: '20px' }}>
                  <p style={{ fontSize: '15px', color: '#111827', marginBottom: '16px', lineHeight: 1.6 }}>
                    {question.content}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {question.options.map((option, optIndex) => {
                      let bgColor = '#f9fafb';
                      let borderColor = '#e5e7eb';
                      let textColor = '#374151';

                      if (optIndex === item.correctAnswer) {
                        bgColor = '#dcfce7';
                        borderColor = '#22c55e';
                        textColor = '#166534';
                      } else if (optIndex === item.yourAnswer && !item.correct) {
                        bgColor = '#fee2e2';
                        borderColor = '#ef4444';
                        textColor = '#991b1b';
                      }

                      return (
                        <div
                          key={optIndex}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '10px',
                            background: bgColor,
                            border: `2px solid ${borderColor}`,
                            color: textColor,
                            fontWeight: optIndex === item.correctAnswer || (optIndex === item.yourAnswer && !item.correct) ? 600 : 400,
                          }}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {optIndex === item.correctAnswer && (
                            <span style={{ marginLeft: '8px', color: '#22c55e' }}>✓ Đáp án đúng</span>
                          )}
                          {optIndex === item.yourAnswer && !item.correct && (
                            <span style={{ marginLeft: '8px', color: '#ef4444' }}>(Bạn chọn)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (selectedExam) {
    const question = selectedExam.questions[currentQuestion];
    const selectedAnswer = answers[question._id];
    const answeredCount = Object.keys(answers).length;

    return (
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button
              onClick={handleBackToExams}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '8px',
              }}
            >
              ← Quay lại
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>{selectedExam.title}</h1>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#111827',
              borderRadius: '12px',
            }}
          >
            <Clock style={{ width: '20px', height: '20px', color: '#fff' }} />
            <span style={{ fontSize: '20px', fontWeight: 600, color: 'white' }}>{formatTime(timeSpent)}</span>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                Câu {currentQuestion + 1} / {selectedExam.questions.length}
              </span>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: getLevelColor(question.level).bg,
                  color: getLevelColor(question.level).color,
                }}
              >
                {question.level === 'easy' ? 'Dễ' : question.level === 'medium' ? 'Trung bình' : 'Khó'}
              </span>
            </div>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Đã trả lời: {answeredCount}/{selectedExam.questions.length}
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${((currentQuestion + 1) / selectedExam.questions.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', lineHeight: 1.6 }}>
              {question.content}
            </h2>
          </div>

          <div style={{ padding: '16px 24px' }}>
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question._id, index)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  marginBottom: '12px',
                  borderRadius: '12px',
                  border: selectedAnswer === index ? '2px solid #22c55e' : '2px solid #e5e7eb',
                  background: selectedAnswer === index ? '#f0fdf4' : 'white',
                  color: selectedAnswer === index ? '#166534' : '#374151',
                  fontSize: '15px',
                  fontWeight: selectedAnswer === index ? 500 : 400,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: selectedAnswer === index ? '#22c55e' : '#f3f4f6',
                    color: selectedAnswer === index ? 'white' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
                {selectedAnswer === index && (
                  <CheckCircle style={{ marginLeft: 'auto', width: '20px', height: '20px', color: '#22c55e' }} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
          <button
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              background: currentQuestion === 0 ? '#f3f4f6' : 'white',
              color: currentQuestion === 0 ? '#9ca3af' : '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ArrowRight style={{ width: '20px', height: '20px', transform: 'rotate(180deg)' }} />
            Câu trước
          </button>

          {currentQuestion < selectedExam.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion((prev) => Math.min(selectedExam.questions.length - 1, prev + 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Câu tiếp theo
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 500,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang nộp bài...
                </>
              ) : (
                <>
                  <Trophy style={{ width: '20px', height: '20px' }} />
                  Nộp bài thi
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>Thi Tiếng Anh</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
          Xin chào <strong>{user?.name}</strong>, hãy chọn bài thi để bắt đầu
        </p>
      </div>

      {isLoadingQuestions ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : exams.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '48px',
            textAlign: 'center',
          }}
        >
          <BookOpen style={{ width: '64px', height: '64px', color: '#9ca3af', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
            Chưa có bài thi nào
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Hiện tại chưa có bài thi nào hoạt động. Vui lòng quay lại sau.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {exams.map((exam) => (
            <div
              key={exam._id}
              style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => handleSelectExam(exam)}
            >
              <div
                style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                }}
              >
                <BookOpen style={{ width: '40px', height: '40px', color: 'white', marginBottom: '12px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>
                  {exam.title}
                </h3>
                {exam.description && (
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                    {exam.description}
                  </p>
                )}
              </div>
              <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {exam.questionCount || 0} câu hỏi
                </span>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #22c55e',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Play style={{ width: '16px', height: '16px' }} />
                  Bắt đầu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

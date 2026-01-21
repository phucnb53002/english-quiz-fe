'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { Button, Card, Modal, Table } from '@/components/ui';
import { testsApi } from '@/lib/api-routes';
import { Question, User } from '@/types';
import { useToast } from '@/components/ToastProvider';

interface QuestionFormData {
  content: string;
  options: string[];
  correctAnswer: number;
  level: 'easy' | 'medium' | 'hard';
}

const initialFormState: QuestionFormData = {
  content: '',
  options: ['', ''],
  correctAnswer: 0,
  level: 'easy',
};

export default function TestsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Question | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<QuestionFormData>(initialFormState);
  const [optionList, setOptionList] = useState<string[]>(['', '']);

  const { addToast } = useToast();

  const fetchQuestions = async () => {
    try {
      const data = await testsApi.getAll();
      setQuestions(data);
    } catch {
      addToast('Failed to fetch questions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchQuestions();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.content || formData.content.length < 10) {
      errors.content = 'Question must be at least 10 characters';
    }

    const validOptions = optionList.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      errors.options = 'At least 2 options are required';
    }

    if (formData.correctAnswer < 0 || formData.correctAnswer >= validOptions.length) {
      errors.correctAnswer = 'Please select a valid correct answer';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData(initialFormState);
    setOptionList(['', '']);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
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
    setOptionList(['', '']);
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
        addToast('Question updated successfully', 'success');
      } else {
        await testsApi.create(submitData);
        addToast('Question created successfully', 'success');
      }
      closeModal();
      fetchQuestions();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await testsApi.delete(deleteConfirm._id);
      addToast('Question deleted successfully', 'success');
      setDeleteConfirm(null);
      fetchQuestions();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const addOption = () => {
    if (optionList.length < 6) {
      setOptionList([...optionList, '']);
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

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.options.some((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || q.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const columns = [
    {
      key: 'content',
      header: 'Question',
      render: (q: Question) => (
        <div className="max-w-md truncate">{q.content}</div>
      ),
    },
    {
      key: 'options',
      header: 'Options',
      render: (q: Question) => (
        <div className="flex gap-1">
          {q.options.map((opt, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded text-xs ${
                idx === q.correctAnswer
                  ? 'bg-green-100 text-green-800 font-medium'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {String.fromCharCode(65 + idx)}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: (q: Question) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            q.level === 'easy'
              ? 'bg-green-100 text-green-800'
              : q.level === 'medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {q.level}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (q: Question) => new Date(q.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">English Test Questions</h1>
        <p className="text-gray-500">Manage English test questions and answers</p>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          {currentUser?.role === 'admin' && (
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          )}
        </div>
      </Card>

      <Card
        title="Questions"
        actions={
          <span className="text-sm text-gray-500">
            {filteredQuestions.length} questions
          </span>
        }
      >
        <Table
          data={filteredQuestions}
          columns={columns}
          onEdit={currentUser?.role === 'admin' ? openEditModal : undefined}
          onDelete={
            currentUser?.role === 'admin' ? (q) => setDeleteConfirm(q) : undefined
          }
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingQuestion ? 'Edit Question' : 'Create Question'}
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter your question..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
            {formErrors.content && (
              <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Options
            </label>
            <div className="space-y-2">
              {optionList.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, correctAnswer: index })}
                    className={`p-2 rounded-lg transition-colors ${
                      formData.correctAnswer === index
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {formData.correctAnswer === index ? (
                      <span className="w-5 h-5 flex items-center justify-center text-green-600 font-bold">✓</span>
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                    )}
                  </button>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {optionList.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addOption}
              className="mt-2"
              disabled={optionList.length >= 6}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </Button>
            {formErrors.options && (
              <p className="mt-1 text-sm text-red-600">{formErrors.options}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as 'easy' | 'medium' | 'hard' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              {editingQuestion ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Question"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this question? This action cannot be
          undone.
        </p>
        <div className="bg-gray-50 p-3 rounded-lg mb-6">
          <p className="text-sm text-gray-600 line-clamp-2">
            {deleteConfirm?.content}
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDeleteConfirm(null)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

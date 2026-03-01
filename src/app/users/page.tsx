"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { usersApi } from "@/lib/api-routes";
import { User } from "@/types";
import { useToast } from "@/components/ToastProvider";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

const initialFormState: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<UserFormData>(initialFormState);

  const { addToast } = useToast();

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch {
      addToast("Không thể tải danh sách người dùng", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchUsers();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      errors.name = "Họ tên phải có ít nhất 2 ký tự";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Vui lòng nhập email hợp lệ";
    }

    if (!editingUser && (!formData.password || formData.password.length < 8)) {
      errors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(initialFormState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData(initialFormState);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete (updateData as Record<string, unknown>).password;
        }
        await usersApi.update(editingUser._id, updateData);
        addToast("Cập nhật người dùng thành công", "success");
      } else {
        await usersApi.create(formData);
        addToast("Tạo người dùng thành công", "success");
      }
      closeModal();
      fetchUsers();
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
      await usersApi.delete(deleteConfirm._id);
      addToast("Xóa người dùng thành công", "success");
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast(err.response?.data?.message || "Xóa thất bại", "error");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#111827" }}>
          Quản lý người dùng
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
          Quản lý tài khoản và phân quyền người dùng
        </p>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: "280px",
              maxWidth: "400px",
            }}
          >
            <Search
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "20px",
                height: "20px",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          {currentUser?.role === "admin" && (
            <button
              onClick={openCreateModal}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(99, 102, 241, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Plus style={{ width: "18px", height: "18px" }} />
              Thêm người dùng
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f9fafb",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
            Danh sách người dùng
          </h2>
          <span
            style={{
              fontSize: "13px",
              color: "#6b7280",
              background: "#e5e7eb",
              padding: "4px 12px",
              borderRadius: "20px",
            }}
          >
            {filteredUsers.length} người dùng
          </span>
        </div>

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
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Người dùng
                </th>
                <th
                  style={{
                    padding: "14px 24px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "14px 24px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Vai trò
                </th>
                <th
                  style={{
                    padding: "14px 24px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Ngày tạo
                </th>
                {currentUser?.role === "admin" && (
                  <th
                    style={{
                      padding: "14px 24px",
                      textAlign: "right",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    Thao tác
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user._id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    background: index % 2 === 0 ? "white" : "#f9fafb",
                  }}
                >
                  <td style={{ padding: "16px 24px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500, color: "#111827" }}>
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "16px 24px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {user.email}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 500,
                        background:
                          user.role === "admin" ? "#f3e8ff" : "#dbeafe",
                        color: user.role === "admin" ? "#7c3aed" : "#2563eb",
                      }}
                    >
                      {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "16px 24px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  {currentUser?.role === "admin" && (
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() => openEditModal(user)}
                          style={{
                            padding: "8px 14px",
                            background: "#f3f4f6",
                            color: "#374151",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = "#e5e7eb";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "#f3f4f6";
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          style={{
                            padding: "8px 14px",
                            background: "#fef2f2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = "#fee2e2";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "#fef2f2";
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={currentUser?.role === "admin" ? 5 : 4}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "#9ca3af",
                    }}
                  >
                    Không có dữ liệu người dùng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              maxWidth: "480px",
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
                {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  Họ và tên
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: formErrors.name ? "#ef4444" : "#d1d5db",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                {formErrors.name && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#ef4444",
                      marginTop: "4px",
                    }}
                  >
                    {formErrors.name}
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
                    marginBottom: "6px",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: formErrors.email ? "#ef4444" : "#d1d5db",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                {formErrors.email && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#ef4444",
                      marginTop: "4px",
                    }}
                  >
                    {formErrors.email}
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
                    marginBottom: "6px",
                  }}
                >
                  {editingUser
                    ? "Mật khẩu mới (để trống nếu không đổi)"
                    : "Mật khẩu"}
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: formErrors.password ? "#ef4444" : "#d1d5db",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                {formErrors.password && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#ef4444",
                      marginTop: "4px",
                    }}
                  >
                    {formErrors.password}
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
                    marginBottom: "6px",
                  }}
                >
                  Vai trò
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "admin" | "user",
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <option value="user">Người dùng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
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
                      : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmitting && (
                    <svg
                      className="animate-spin"
                      style={{ width: "16px", height: "16px" }}
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {editingUser ? "Cập nhật" : "Tạo mới"}
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
                Xóa người dùng
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "24px",
                }}
              >
                Bạn có chắc chắn muốn xóa người dùng{" "}
                <strong>{deleteConfirm.name}</strong>? Hành động này không thể
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

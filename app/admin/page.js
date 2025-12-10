"use client";

import { useState, useEffect } from "react";

export default function AdminPanel() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [members, setMembers] = useState([]);
    const [editingMember, setEditingMember] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        unique_code: "",
        member_name: "",
        wish_items: ["", "", ""]
    });
    const [message, setMessage] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Check for existing session
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (token) {
            setIsLoggedIn(true);
            fetchMembers();
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError("");

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem("adminToken", data.token);
                setIsLoggedIn(true);
                fetchMembers();
            } else {
                setLoginError(data.error || "Login failed");
            }
        } catch (error) {
            setLoginError("Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        setIsLoggedIn(false);
        setUserid("");
        setPassword("");
    };

    const fetchMembers = async () => {
        try {
            const response = await fetch("/api/admin/members");
            const data = await response.json();
            setMembers(data.members || []);
        } catch (error) {
            console.error("Failed to fetch members:", error);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const wishItems = formData.wish_items.filter(item => item.trim() !== "");

        if (wishItems.length === 0) {
            setMessage({ type: "error", text: "At least one wish item is required" });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/admin/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    unique_code: formData.unique_code,
                    member_name: formData.member_name,
                    wish_items: wishItems
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: "Member added successfully!" });
                setFormData({ unique_code: "", member_name: "", wish_items: ["", "", ""] });
                setShowAddForm(false);
                fetchMembers();
            } else {
                setMessage({ type: "error", text: data.error });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to add member" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateMember = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const wishItems = formData.wish_items.filter(item => item.trim() !== "");

        try {
            const response = await fetch("/api/admin/members", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    unique_code: formData.unique_code,
                    member_name: formData.member_name,
                    wish_items: wishItems
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: "Member updated successfully!" });
                setEditingMember(null);
                setFormData({ unique_code: "", member_name: "", wish_items: ["", "", ""] });
                fetchMembers();
            } else {
                setMessage({ type: "error", text: data.error });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update member" });
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            const response = await fetch("/api/admin/members", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unique_code: deleteConfirm }),
            });

            if (response.ok) {
                setMessage({ type: "success", text: "Member deleted successfully!" });
                fetchMembers();
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to delete member" });
        } finally {
            setDeleteConfirm(null);
        }
    };

    const startEdit = (member) => {
        setEditingMember(member.unique_code);
        setFormData({
            unique_code: member.unique_code,
            member_name: member.member_name,
            wish_items: [...member.wish_items, "", "", ""].slice(0, 3)
        });
        setShowAddForm(false);
    };

    const cancelEdit = () => {
        setEditingMember(null);
        setFormData({ unique_code: "", member_name: "", wish_items: ["", "", ""] });
    };

    const updateWishItem = (index, value) => {
        const newItems = [...formData.wish_items];
        newItems[index] = value;
        setFormData({ ...formData, wish_items: newItems });
    };

    // Login Screen
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-4">🔐</div>
                        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                        <p className="text-gray-500 text-sm mt-2">Secret Santa 2025</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                User ID
                            </label>
                            <input
                                type="text"
                                value={userid}
                                onChange={(e) => setUserid(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
                                placeholder="Enter user ID"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        {loginError && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                ❌ {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="/" className="text-blue-600 hover:underline text-sm">
                            ← Back to Secret Santa
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
                            <h3 className="text-xl font-semibold text-white mb-4">⚠️ Confirm Delete</h3>
                            <p className="text-slate-300 mb-6">
                                Are you sure you want to delete member <strong className="text-white">{deleteConfirm}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">🎄 Admin Panel</h1>
                        <p className="text-slate-400">Manage Secret Santa Members</p>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href="/"
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            View Site
                        </a>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${message.type === "success"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                    >
                        {message.type === "success" ? "✅" : "❌"} {message.text}
                    </div>
                )}

                {/* Add Member Button */}
                {!showAddForm && !editingMember && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="mb-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                        <span>➕</span> Add New Member
                    </button>
                )}

                {/* Add/Edit Form */}
                {(showAddForm || editingMember) && (
                    <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {editingMember ? `Edit Member: ${editingMember}` : "Add New Member"}
                        </h2>
                        <form onSubmit={editingMember ? handleUpdateMember : handleAddMember} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Unique Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.unique_code}
                                        onChange={(e) => setFormData({ ...formData, unique_code: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g., REC004"
                                        disabled={!!editingMember}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Member Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.member_name}
                                        onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g., Alice Wonder"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Wish Items (Priority Order)
                                </label>
                                {formData.wish_items.map((item, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateWishItem(index, e.target.value)}
                                        className="w-full px-4 py-2 mb-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={`Wish item ${index + 1}${index === 0 ? " (required)" : " (optional)"}`}
                                        required={index === 0}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? "Saving..." : editingMember ? "Update Member" : "Add Member"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        cancelEdit();
                                    }}
                                    className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Members Table */}
                <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-xl font-semibold text-white">
                            Members ({members.length})
                        </h2>
                    </div>

                    {members.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            No members yet. Add your first member!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Code</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Top Wish</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {members.map((member) => (
                                        <tr key={member.unique_code} className="hover:bg-slate-700/30">
                                            <td className="px-4 py-3 text-slate-300 font-mono">{member.unique_code}</td>
                                            <td className="px-4 py-3 text-white">{member.member_name}</td>
                                            <td className="px-4 py-3 text-slate-400">{member.wish_items[0]}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => startEdit(member)}
                                                    className="px-3 py-1 mr-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(member.unique_code)}
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

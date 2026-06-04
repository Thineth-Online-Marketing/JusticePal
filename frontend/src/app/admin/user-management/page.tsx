"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Scale,
  UserCheck,
  AlertTriangle,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import UserStatsCard from "./components/UserStatsCard";
import UserFilters from "./components/UserFilters";
import UserTable from "./components/UserTable";
import UserCardMobile from "./components/UserCardMobile";
import AddUserModal from "./components/AddUserModal";
import { UserData } from "./components/UserTableRow";

/* ── mock data ───────────────────────────────────────────── */

const initialUsers: UserData[] = [
  {
    id: 1,
    name: "Harvey Specter",
    email: "harvey.s@pearsonhardman.com",
    accountType: "Lawyer",
    registrationDate: "Oct 12, 2023",
    status: "Active",
    avatar: "HS",
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane.doe@example.com",
    accountType: "Client",
    registrationDate: "Nov 04, 2023",
    status: "Active",
    avatar: "JD",
  },
  {
    id: 3,
    name: "Marcus Sterling",
    email: "m.sterling@lawcorp.io",
    accountType: "Lawyer",
    registrationDate: "Dec 01, 2023",
    status: "Suspended",
    avatar: "MS",
  },
  {
    id: 4,
    name: "Sarah Jenkins",
    email: "s.jenkins@enterprise.com",
    accountType: "Client (Enterprise)",
    registrationDate: "Dec 15, 2023",
    status: "Active",
    avatar: "SJ",
  },
];

const statsCards = [
  {
    label: "Total Users",
    value: "1,284",
    subtitle: "+12% from last month",
    icon: Users,
    accent: "#3b82f6",
  },
  {
    label: "Active Lawyers",
    value: "452",
    subtitle: "Verified bar members",
    icon: Scale,
    accent: "#1e3a8a",
  },
  {
    label: "Active Clients",
    value: "832",
    subtitle: "Personal & Enterprise",
    icon: UserCheck,
    accent: "#10b981",
  },
  {
    label: "Pending Verifications",
    value: "18",
    subtitle: "Requires attention",
    icon: AlertTriangle,
    accent: "#f59e0b",
    highlight: true,
  },
];

/* ── helpers ──────────────────────────────────────────────── */

const ITEMS_PER_PAGE = 4;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ── component ───────────────────────────────────────────── */

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  /* ── filtering ─────────────────────────────────────────── */

  const filteredUsers = useMemo(() => {
    let result = users;

    // Tab filter
    if (activeTab === "Lawyer") {
      result = result.filter((u) => u.accountType === "Lawyer");
    } else if (activeTab === "Client") {
      result = result.filter((u) =>
        u.accountType.startsWith("Client")
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [users, activeTab, statusFilter, searchQuery]);

  /* ── pagination ────────────────────────────────────────── */

  const totalItems = 1284; // Mock total for display
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  // Reset to page 1 on filter change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  /* ── page numbers visible ──────────────────────────────── */

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  /* ── export CSV ────────────────────────────────────────── */

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Account Type",
      "Registration Date",
      "Status",
    ];
    const rows = filteredUsers.map((u) => [
      u.name,
      u.email,
      u.accountType,
      u.registrationDate,
      u.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── add user ──────────────────────────────────────────── */

  const handleAddUser = (newUser: {
    name: string;
    email: string;
    accountType: string;
    status: string;
  }) => {
    const user: UserData = {
      id: users.length + 1,
      name: newUser.name,
      email: newUser.email,
      accountType: newUser.accountType,
      registrationDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      status: newUser.status as UserData["status"],
      avatar: getInitials(newUser.name),
    };
    setUsers((prev) => [user, ...prev]);
  };

  /* ── action handlers ───────────────────────────────────── */

  const handleView = (user: UserData) => {
    alert(`Viewing profile: ${user.name}\nEmail: ${user.email}\nType: ${user.accountType}\nStatus: ${user.status}`);
  };

  const handleSuspend = (user: UserData) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "Suspended" ? "Active" : "Suspended" }
          : u
      )
    );
  };

  const handleDelete = (user: UserData) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
  };

  return (
    <>
      {/* ── PAGE HEADER ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Oversee and manage the accounts of legal professionals and clients.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] sm:text-[13px] font-semibold rounded-lg transition-all hover:shadow-md"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] sm:text-[13px] font-semibold rounded-lg transition-all hover:shadow-lg text-white"
            style={{
              background:
                "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            }}
          >
            <Plus size={14} />
            Add New User
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((card) => (
          <UserStatsCard
            key={card.label}
            label={card.label}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            accent={card.accent}
            highlight={card.highlight}
          />
        ))}
      </div>

      {/* ── FILTERS ───────────────────────────────────────── */}
      <UserFilters
        activeTab={activeTab}
        onTabChange={handleTabChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* ── USER TABLE (Desktop) ──────────────────────────── */}
      <UserTable
        users={paginatedUsers}
        onView={handleView}
        onSuspend={handleSuspend}
        onDelete={handleDelete}
      />

      {/* ── USER CARDS (Mobile) ───────────────────────────── */}
      <UserCardMobile
        users={paginatedUsers}
        onView={handleView}
        onSuspend={handleSuspend}
        onDelete={handleDelete}
      />

      {/* ── PAGINATION ────────────────────────────────────── */}
      <div
        className="rounded-xl px-4 sm:px-5 py-3.5"
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Info text */}
          <p className="text-[12px] sm:text-[13px] text-slate-400 order-2 sm:order-1">
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {startItem}–{endItem}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {totalItems.toLocaleString()}
            </span>{" "}
            users
          </p>

          {/* Pagination controls */}
          <div className="flex items-center gap-1 order-1 sm:order-2">
            {/* Previous */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
              }}
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-0.5">
              {getVisiblePages().map((page, idx) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 py-1.5 text-[12px] text-slate-400"
                    >
                      …
                    </span>
                  );
                }
                const pageNum = page as number;
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className="min-w-[32px] py-1.5 text-[12px] font-medium rounded-lg transition-all"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
                        : "transparent",
                      color: isActive ? "#fff" : "#64748b",
                      boxShadow: isActive
                        ? "0 2px 4px rgba(30,58,138,0.25)"
                        : "none",
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next */}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
              }}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── ADD USER MODAL ────────────────────────────────── */}
      <AddUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddUser}
      />
    </>
  );
}

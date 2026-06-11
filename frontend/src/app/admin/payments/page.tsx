"use client";

import React, { useState } from "react";
import {
  Download,
  Filter,
  Calendar,
  Wallet,
  CalendarDays,
  RefreshCw,
  Award,
  MoreVertical,
  CreditCard,
  Landmark,
  Banknote,
  TrendingUp
} from "lucide-react";

// Mock Data
const paymentsData = [
  {
    trxId: "#TRX-89241",
    date: "Oct 24, 2023 • 14:20",
    clientInitials: "JD",
    clientName: "John Doe",
    clientBg: "bg-slate-100 text-slate-600",
    lawyerName: "Sarah Jenkins, Esq.",
    amount: "$3,500.00",
    methodText: "Visa **** 4242",
    methodIcon: CreditCard,
    status: "COMPLETED",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    trxId: "#TRX-89240",
    date: "Oct 24, 2023 • 11:05",
    clientInitials: "AW",
    clientName: "Alice Wong",
    clientBg: "bg-slate-100 text-slate-600",
    lawyerName: "Marcus Sterling",
    amount: "$1,200.00",
    methodText: "ACH TRANSFER",
    methodIcon: Landmark,
    status: "PROCESSING",
    statusColor: "bg-blue-100 text-blue-700",
  },
  {
    trxId: "#TRX-89239",
    date: "Oct 23, 2023 • 18:45",
    clientInitials: "RM",
    clientName: "Robert Miller",
    clientBg: "bg-slate-100 text-slate-600",
    lawyerName: "Elena Rodriguez",
    amount: "$850.00",
    methodText: "PayPal",
    methodIcon: Banknote,
    status: "COMPLETED",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    trxId: "#TRX-89238",
    date: "Oct 23, 2023 • 09:12",
    clientInitials: "BK",
    clientName: "Brian Kim",
    clientBg: "bg-slate-100 text-slate-600",
    lawyerName: "Sarah Jenkins, Esq.",
    amount: "$12,400.00",
    methodText: "Amex **** 1005",
    methodIcon: CreditCard,
    status: "FLAGGED",
    statusColor: "bg-amber-100 text-amber-700",
  },
];

export default function PaymentsMonitoringPage() {
  const [activeTab, setActiveTab] = useState("All Transactions");

  return (
    <div className="space-y-6 font-[var(--font-inter)] text-slate-800 pb-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f1d3d]">Payments Monitoring</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time oversight of all platform financial movements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar size={16} />
            This Month
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B3A6B]">
              <Wallet size={18} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp size={12} />
              12.5%
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">$1,284,500.00</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <CalendarDays size={18} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp size={12} />
              8.2%
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Monthly Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">$142,300.00</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <RefreshCw size={18} />
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Ongoing
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Pending Payouts</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">$28,450.00</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[140px]" style={{ background: '#1c346b' }}>
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
              <Award size={18} />
            </div>
            <span className="text-xs font-bold text-amber-400 mt-2">
              Top Performance
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white/70">Lawyer Commissions</p>
            <p className="text-2xl font-bold text-white mt-0.5">$68,200.00</p>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-6">
            {["All Transactions", "Completed", "Pending", "Refunded"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold pb-4 -mb-[17px] transition-colors border-b-2 ${
                  activeTab === tab 
                  ? "border-[#1B3A6B] text-[#1B3A6B]" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mt-4 sm:mt-0">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Filter
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lawyer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paymentsData.map((trx, i) => {
                const Icon = trx.methodIcon;
                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-800">{trx.trxId}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{trx.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${trx.clientBg}`}>
                          {trx.clientInitials}
                        </div>
                        <p className="text-xs font-bold text-slate-800">{trx.clientName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-800">{trx.lawyerName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-800">{trx.amount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Icon size={14} className="text-slate-400" />
                        {trx.methodText}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-[9px] font-bold rounded-full uppercase tracking-widest ${trx.statusColor}`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-[#1B3A6B] transition-colors p-1">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-[11px] font-semibold text-slate-500">Showing 1-10 of 2,482 transactions</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-500 hover:bg-slate-50 shadow-sm">Previous</button>
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-800 hover:bg-slate-50 shadow-sm">Next</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-200/60 text-[11px] font-medium text-slate-400">
        <p>© 2026 JusticePal LegalTech Solutions Inc. All rights reserved.</p>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <button className="hover:text-slate-600">Compliance Policy</button>
          <button className="hover:text-slate-600">System Status</button>
        </div>
      </div>

    </div>
  );
}

"use client";

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
        <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Admin Approval</h1>
        <p className="text-gray-500 mb-8">
          Your profile and Lawyer ID are currently being reviewed by our administration team. 
          You will receive an email once your account is verified, unlocking full access to your dashboard.
        </p>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors rounded-lg font-medium"
        >
          Check Status Again
        </button>
      </div>
    </div>
  );
}

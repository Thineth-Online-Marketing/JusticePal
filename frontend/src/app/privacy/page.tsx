"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f8fafc" }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: "80px" }} className="w-full">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
            <h1 className="text-3xl font-black text-[#1B3A6B] mb-6">Privacy Policy</h1>
            <p className="text-gray-500 mb-8 text-sm">Last updated: June 28, 2026</p>
            
            <div className="space-y-8 text-gray-700 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                <p>Welcome to JusticePal. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
                <p>We collect personal information that you voluntarily provide to us when you register on the Website, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Website or otherwise when you contact us.</p>
                <ul className="list-disc pl-5 mt-3 space-y-2">
                  <li><strong>Personal Information:</strong> Name, email address, phone number, passwords, and similar security information.</li>
                  <li><strong>Case Information:</strong> Details you provide regarding your legal inquiries and consultations.</li>
                  <li><strong>Payment Information:</strong> We collect data necessary to process your payment if you make purchases.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
                <p>We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
                <ul className="list-disc pl-5 mt-3 space-y-2">
                  <li>To facilitate account creation and logon process.</li>
                  <li>To send you administrative information.</li>
                  <li>To fulfill and manage your legal consultations.</li>
                  <li>To protect our Services and ensure security.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">4. Information Sharing</h2>
                <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. When you consult with a lawyer through JusticePal, relevant case details are shared securely with the chosen legal professional.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
                <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contact Us</h2>
                <p>If you have questions or comments about this policy, you may email us at privacy@justicepal.com or by post to:</p>
                <address className="mt-3 not-italic text-gray-600 bg-gray-50 p-4 rounded-lg">
                  JusticePal Inc.<br/>
                  Colombo 03<br/>
                  Sri Lanka
                </address>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

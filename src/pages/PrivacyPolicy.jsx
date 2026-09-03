import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="policy-page-wrapper">
      <style>{`
        .policy-page-wrapper {
          min-height: 100vh;
          background-color: #f4f6f8;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          box-sizing: border-box;
        }

        .policy-card {
          max-width: 900px;
          width: 100%;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 16px;
          padding: clamp(20px, 5vw, 40px);
          box-shadow: 0 10px 25px rgba(2, 89, 89, 0.08);
          box-sizing: border-box;
        }

        .policy-header {
          background: linear-gradient(135deg, #025959 0%, #008080 100%);
          color: #ffffff;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
        }

        .policy-header h1 {
          margin: 0 0 10px 0;
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 800;
        }

        .policy-header p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .policy-body {
          color: #334155;
          line-height: 1.7;
        }

        .policy-body h2 {
          color: #025959;
          font-size: 18px;
          font-weight: 700;
          margin-top: 24px;
          margin-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 6px;
        }

        .policy-body p {
          font-size: 15px;
          margin-bottom: 16px;
        }

        .home-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #008080;
          color: #ffffff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 20px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(0, 128, 128, 0.2);
        }

        .home-back-btn:hover {
          background: #025959;
          transform: translateY(-1px);
        }
      `}</style>

      <div className="policy-card">
        <Link to="/" className="home-back-btn">
          🏠 Back to Home
        </Link>

        <div className="policy-header">
          <h1>Privacy Policy</h1>
          <p>Last updated: September 2026</p>
        </div>

        <div className="policy-body">
          <p>
            Welcome to <strong>BCA Portal</strong> (bcaeasylearn.vercel.app). We respect your privacy and are committed to protecting your personal data.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when registering, such as your Name, Mobile number, Email address, and Semester details.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the collected information to manage your account, provide access to study materials (PDFs, PYQs, Project Codes), and improve our services.
          </p>

          <h2>3. Data Protection</h2>
          <p>
            Your personal data is secure with us. We do not sell, trade, or share your personal information with third parties.
          </p>

          <h2>4. Contact Us</h2>
          <p>
            If you have any questions, reach out to us at: <strong>support@bcaeasylearn.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
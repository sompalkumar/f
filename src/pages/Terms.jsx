import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="terms-page-wrapper">
      <style>{`
        .terms-page-wrapper {
          min-height: 100vh;
          background-color: #f4f6f8;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          box-sizing: border-box;
        }

        .terms-card {
          max-width: 900px;
          width: 100%;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 16px;
          padding: clamp(20px, 5vw, 40px);
          box-shadow: 0 10px 25px rgba(2, 89, 89, 0.08);
          box-sizing: border-box;
        }

        .terms-header {
          background: linear-gradient(135deg, #025959 0%, #008080 100%);
          color: #ffffff;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
        }

        .terms-header h1 {
          margin: 0 0 10px 0;
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 800;
        }

        .terms-header p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .terms-body {
          color: #334155;
          line-height: 1.7;
        }

        .terms-body h2 {
          color: #025959;
          font-size: 18px;
          font-weight: 700;
          margin-top: 24px;
          margin-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 6px;
        }

        .terms-body p {
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

      <div className="terms-card">
        <Link to="/" className="home-back-btn">
          🏠 Back to Home
        </Link>

        <div className="terms-header">
          <h1>Terms & Conditions</h1>
          <p>Please read these terms carefully before using BCA Portal</p>
        </div>

        <div className="terms-body">
          <p>
            Welcome to <strong>BCA Portal</strong>. By accessing this website, you agree to comply with and be bound by these terms and conditions.
          </p>

          <h2>1. Educational Use Only</h2>
          <p>
            All study materials, handwritten notes, and code samples provided on this portal are strictly for personal and educational purposes.
          </p>

          <h2>2. Account Responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. Unregistered or unauthorized access is restricted.
          </p>

          <h2>3. Intellectual Property</h2>
          <p>
            Users must not re-sell, redistribute, or reproduce the study materials for commercial gain without explicit prior permission.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
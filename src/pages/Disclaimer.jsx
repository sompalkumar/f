import React from 'react';
import { Link } from 'react-router-dom';

const Disclaimer = () => {
  return (
    <div className="disclaimer-page-wrapper">
      <style>{`
        .disclaimer-page-wrapper {
          min-height: 100vh;
          background-color: #f4f6f8;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          box-sizing: border-box;
        }

        .disclaimer-card {
          max-width: 900px;
          width: 100%;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 16px;
          padding: clamp(20px, 5vw, 40px);
          box-shadow: 0 10px 25px rgba(2, 89, 89, 0.08);
          box-sizing: border-box;
        }

        .disclaimer-header {
          background: linear-gradient(135deg, #025959 0%, #008080 100%);
          color: #ffffff;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
        }

        .disclaimer-header h1 {
          margin: 0 0 10px 0;
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 800;
        }

        .disclaimer-header p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .disclaimer-body {
          color: #334155;
          line-height: 1.7;
        }

        .disclaimer-body h2 {
          color: #025959;
          font-size: 18px;
          font-weight: 700;
          margin-top: 24px;
          margin-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 6px;
        }

        .disclaimer-body p {
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

      <div className="disclaimer-card">
        <Link to="/" className="home-back-btn">
          🏠 Back to Home
        </Link>

        <div className="disclaimer-header">
          <h1>Disclaimer</h1>
          <p>Important legal and copyright disclosure</p>
        </div>

        <div className="disclaimer-body">
          <p>
            The information provided on <strong>BCA Portal</strong> is for general educational purposes only.
          </p>

          <h2>1. Copyright & Material Ownership</h2>
          <p>
            We do not claim ownership over official university textbooks or syllabi. All materials belong to their respective copyright holders.
          </p>

          <h2>2. Takedown Requests</h2>
          <p>
            If you are a copyright owner and believe your material has been uploaded without authorization, please contact us at <strong>support@bcaeazylearn.com</strong>. We will remove the content within 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
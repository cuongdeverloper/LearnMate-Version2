// components/Layout/Footer.js
import React from "react";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} LearnMate. All rights reserved.</p>
        <div className="footer-links">
          <button className="footer-link" onClick={() => alert("Điều khoản")}>
            Điều khoản
          </button>
          <button className="footer-link" onClick={() => alert("Chính sách bảo mật")}>
            Chính sách bảo mật
          </button>
          <button className="footer-link" onClick={() => alert("Liên hệ")}>
            Liên hệ
          </button>
          <button className="footer-link" onClick={() => window.open("https://facebook.com", "_blank")}>
            Facebook
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

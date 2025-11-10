// components/Layout/Footer.js
import React from "react";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} LearnMate. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Điều khoản</a>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Liên hệ</a>
          <a href="#">Facebook</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// components/LangLogin.jsx
import React, { useState } from "react";
import Select from "react-select";
import "./LangLogin.scss";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { doLogout } from "../../../redux/action/userAction";

const languageOptions = [
  {
    value: "vi",
    label: (
      <div className="option-item">
        <img src="https://flagcdn.com/w40/vn.png" alt="vn" />
        <span>Tiếng Việt, VND</span>
      </div>
    ),
  },
  {
    value: "en",
    label: (
      <div className="option-item">
        <img src="https://flagcdn.com/w40/us.png" alt="en" />
        <span>English, USD</span>
      </div>
    ),
  },
];

export default function LangLogin() {
  const [selected, setSelected] = useState(languageOptions[0]);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.account);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = () => {
    navigate("/signin");
  };

  const handleLogout = () => {
    dispatch(doLogout());
  };

  return (
    <div className="lang-login">
      <Select
        defaultValue={selected}
        onChange={setSelected}
        options={languageOptions}
        className="custom-select"
        classNamePrefix="react-select"
        isSearchable={false}
      />
      {!isAuthenticated ? (
        <button className="login-btn" onClick={handleLogin}>
          Đăng nhập
        </button>
      ) : (
        <div className="user-info">
          <span style={{ marginRight: "12px" }}>
            {user?.username || "Tài khoản"}
          </span>
          <button className="login-btn logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

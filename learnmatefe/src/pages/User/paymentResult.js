import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import "../../scss/PaymentResult.scss";  // import file scss

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  useEffect(() => {
  }, [queryParams]);

  const isSuccess = queryParams.vnp_ResponseCode === "00";

  return (
    <div className="payment-result-container">
      <h2 className={`payment-result-title ${isSuccess ? "success" : "failure"}`}>
        {isSuccess ? "Thanh toán thành công 🎉" : "Thanh toán thất bại ❌"}
      </h2>

      {isSuccess ? (
        <div className="payment-message success-message">
          <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
          <p><strong>Mã giao dịch:</strong> {queryParams.vnp_TxnRef}</p>
          <p><strong>Số tiền:</strong> {(queryParams.vnp_Amount / 100).toLocaleString()} VND</p>
        </div>
      ) : (
        <div className="payment-message failure-message">
          <p>Thanh toán thất bại hoặc bị hủy.</p>
          <p><strong>Mã lỗi:</strong> {queryParams.vnp_ResponseCode || "Không rõ"}</p>
        </div>
      )}

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/")}
        >
          Quay về Trang chủ
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/tutor")}
        >
          Quay lại tìm thêm
        </button>
      </div>
    </div>
  );
};

export default PaymentResult;

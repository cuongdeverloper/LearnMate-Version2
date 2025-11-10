import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../../scss/PaymentPage.scss";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PaymentPage() {
    const userId = useSelector((state) => state.user.account.id);
    const token = useSelector((state) => state.user.account.access_token);
    const [userPaymentInfo, setUserPaymentInfo] = useState(null);
    const [balance, setBalance] = useState(0);
    const [amountToTopUp, setAmountToTopUp] = useState("");
    const [amountToWithdraw, setAmountToWithdraw] = useState("");
    const [bankAccount, setBankAccount] = useState({
        bankName: '',
        accountNumber: '',
        accountHolderName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [withdrawalHistory, setWithdrawalHistory] = useState([]);
    const [financialFlowHistory, setFinancialFlowHistory] = useState([]);
    // State mới để lựa chọn API cho lịch sử dòng tiền
    const [useCombinedFinancialFlow, setUseCombinedFinancialFlow] = useState(true); // true = /me/financial-flowhistory (FinancialHistory model), false = /me/financial-flow (tự tổng hợp)


    const fetchPaymentData = async () => {
        if (!userId) {
            setError("Không có userId để lấy dữ liệu. Vui lòng đăng nhập lại.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Fetch User Info
            const infoRes = await fetch(`http://localhost:6060/api/payment/me/info`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!infoRes.ok) throw new Error("Lấy thông tin người dùng thất bại.");
            const infoData = await infoRes.json();

            // Fetch Top-up History (payments)
            const historyRes = await fetch(`http://localhost:6060/api/payment/me/payments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!historyRes.ok) throw new Error("Lấy lịch sử nạp tiền thất bại.");
            const historyData = await historyRes.json();

            // Fetch Withdrawal History
            const withdrawalRes = await fetch(`http://localhost:6060/api/payment/me/withdrawals`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!withdrawalRes.ok) throw new Error("Lấy lịch sử rút tiền thất bại.");
            const withdrawalData = await withdrawalRes.json();

            // Fetch Financial Flow History - Dựa trên state `useCombinedFinancialFlow`
            let financialFlowEndpoint = useCombinedFinancialFlow ? 
                                        `http://localhost:6060/api/payment/me/financial-flowhistory` : 
                                        `http://localhost:6060/api/payment/me/financial-flow`;      
            
            const financialFlowRes = await fetch(financialFlowEndpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!financialFlowRes.ok) throw new Error("Lấy lịch sử dòng tiền tổng hợp thất bại.");
            const financialFlowData = await financialFlowRes.json();

            setUserPaymentInfo(infoData.user);
            setBalance(infoData.user.balance || 0);
            setPaymentHistory(historyData.payments || []);
            setWithdrawalHistory(withdrawalData.withdrawals || []);
            setFinancialFlowHistory(financialFlowData.history || []);
        } catch (err) {
            setError(err.message || "Lỗi kết nối.");
            toast.error(`Lỗi: ${err.message || "Không thể tải dữ liệu."}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentData();
    }, [userId, token, useCombinedFinancialFlow]); // Thêm useCombinedFinancialFlow vào dependency để fetch lại khi chuyển đổi

    const handleTopUp = async () => {
        const amount = Number(amountToTopUp);
        if (!amount || amount <= 0) {
            toast.error("Vui lòng nhập số tiền nạp hợp lệ.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:6060/api/payment/payment/create-vnpay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Tạo thanh toán thất bại.");
            }

            const data = await res.json();

            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                throw new Error("Không nhận được URL thanh toán từ server.");
            }
        } catch (err) {
            setError(err.message || "Lỗi khi nạp tiền.");
            toast.error(`Lỗi nạp tiền: ${err.message || "Vui lòng thử lại."}`);
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = Number(amountToWithdraw);
        if (!amount || amount <= 0) {
            toast.error("Vui lòng nhập số tiền rút hợp lệ.");
            return;
        }
        if (amount > balance) {
            toast.error("Số dư tài khoản không đủ để rút số tiền này.");
            return;
        }
        if (!bankAccount.bankName || !bankAccount.accountNumber || !bankAccount.accountHolderName) {
            toast.error("Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:6060/api/payment/payment/withdraw", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount, bankAccount }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Tạo yêu cầu rút tiền thất bại.");
            }

            const data = await res.json();
            toast.success(data.message || "Yêu cầu rút tiền đã được gửi thành công!");
            setAmountToWithdraw("");
            setBankAccount({ bankName: '', accountNumber: '', accountHolderName: '' });
            fetchPaymentData();
        } catch (err) {
            setError(err.message || "Lỗi khi rút tiền.");
            toast.error(`Lỗi rút tiền: ${err.message || "Vui lòng thử lại."}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !userPaymentInfo) {
        return <div className="payment-page__loading">Đang tải thông tin thanh toán...</div>;
    }

    if (error && !userPaymentInfo) {
        return (
            <div className="payment-page__error">
                <p>{error}</p>
                <button onClick={fetchPaymentData}>Thử lại</button>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <nav className="payment-page__navbar">Trang Quản Lý Tài Chính</nav>

            <section className="payment-page__user-info">
                <h3>Thông tin tài khoản</h3>
                <p><strong>Tên:</strong> {userPaymentInfo?.username || "Không xác định"}</p>
                <p><strong>Email:</strong> {userPaymentInfo?.email || "Không xác định"}</p>
                {userPaymentInfo?.phoneNumber && <p><strong>Điện thoại:</strong> {userPaymentInfo.phoneNumber}</p>}
                <h4 className="payment-page__balance">
                    Số dư tài khoản: <span>{balance.toLocaleString()} VND</span>
                </h4>
            </section>

            <section className="payment-page__topup-form">
                <h3>Nạp tiền vào tài khoản</h3>
                <div className="payment-page__input-group">
                    <input
                        type="number"
                        placeholder="Nhập số tiền (VND)"
                        value={amountToTopUp}
                        onChange={(e) => setAmountToTopUp(e.target.value)}
                        min="10000"
                        disabled={loading}
                    />
                    <button onClick={handleTopUp} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Nạp tiền"}
                    </button>
                </div>
            </section>

            <section className="payment-page__withdraw-form">
                <h3>Rút tiền từ tài khoản</h3>
                <div className="payment-page__input-group">
                    <input
                        type="number"
                        placeholder="Số tiền muốn rút (VND)"
                        value={amountToWithdraw}
                        onChange={(e) => setAmountToWithdraw(e.target.value)}
                        min="1000"
                        disabled={loading}
                    />
                </div>
                <div className="payment-page__bank-info-group">
                    <input
                        type="text"
                        placeholder="Tên ngân hàng (Ex: Vietcombank)"
                        value={bankAccount.bankName}
                        onChange={(e) => setBankAccount({ ...bankAccount, bankName: e.target.value })}
                        disabled={loading}
                    />
                    <input
                        type="text"
                        placeholder="Số tài khoản ngân hàng"
                        value={bankAccount.accountNumber}
                        onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                        disabled={loading}
                    />
                    <input
                        type="text"
                        placeholder="Tên chủ tài khoản"
                        value={bankAccount.accountHolderName}
                        onChange={(e) => setBankAccount({ ...bankAccount, accountHolderName: e.target.value })}
                        disabled={loading}
                    />
                </div>
                <button className="payment-page__withdraw-button" onClick={handleWithdraw} disabled={loading}>
                    {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu rút tiền"}
                </button>
            </section>

            <hr/>

            <section className="payment-page__history">
                <h3>Lịch sử dòng tiền</h3>
                <div className="payment-page__history-toggle">
                    <button 
                        className={useCombinedFinancialFlow ? 'active' : ''}
                        onClick={() => setUseCombinedFinancialFlow(true)}
                        disabled={loading}
                    >
                        Lịch sử từ FinancialHistory Model
                    </button>
                    <button 
                        className={!useCombinedFinancialFlow ? 'active' : ''}
                        onClick={() => setUseCombinedFinancialFlow(false)}
                        disabled={loading}
                    >
                        Lịch sử tổng hợp thủ công
                    </button>
                </div>

                {financialFlowHistory.length === 0 ? (
                    <p>Chưa có giao dịch nào trong lịch sử dòng tiền.</p>
                ) : (
                    <table className="payment-page__history-table">
                        <thead>
                            <tr>
                                <th>ID Giao dịch</th>
                                <th>Ngày giờ</th>
                                <th>Loại</th>
                                <th>Số tiền (VND)</th>
                                <th>Thay đổi số dư</th>
                                <th>Trạng thái</th>
                                <th>Mô tả</th>
                            </tr>
                        </thead>
                        <tbody>
                            {financialFlowHistory.map((item, idx) => (
                                <tr key={item.id || item._id || idx} className={idx % 2 === 0 ? "even" : "odd"}>
                                    <td>{(item.id || item._id)?.slice(-8)}</td>
                                    <td>{new Date(item.date || item.createdAt).toLocaleString()}</td>
                                    <td>{item.type}</td>
                                    <td>{item.amount.toLocaleString()}</td>
                                    <td className={item.balanceChange > 0 ? 'text-success' : 'text-danger'}>
                                        {item.balanceChange > 0 ? '+' : ''}{item.balanceChange.toLocaleString()}
                                    </td>
                                    <td>{item.status}</td>
                                    <td>{item.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <hr/>

            {/* Các phần lịch sử riêng lẻ (nạp, rút) có thể giữ lại hoặc ẩn đi */}
            <section className="payment-page__history">
                <h3>Lịch sử nạp tiền (Chi tiết)</h3>
                {paymentHistory.length === 0 ? (
                    <p>Chưa có giao dịch nạp tiền nào.</p>
                ) : (
                    <table className="payment-page__history-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ngày giờ</th>
                                <th>Số tiền (VND)</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.map((item, idx) => (
                                <tr key={item._id || idx} className={idx % 2 === 0 ? "even" : "odd"}>
                                    <td>{item._id.slice(-8)}</td>
                                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                                    <td>{item.amount.toLocaleString()}</td>
                                    <td>{item.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <hr/>

            <section className="payment-page__history">
                <h3>Lịch sử rút tiền (Chi tiết)</h3>
                {withdrawalHistory.length === 0 ? (
                    <p>Chưa có yêu cầu rút tiền nào.</p>
                ) : (
                    <table className="payment-page__history-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ngày giờ</th>
                                <th>Số tiền (VND)</th>
                                <th>Trạng thái</th>
                                <th>Ngân hàng</th>
                                <th>Số TK</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawalHistory.map((item, idx) => (
                                <tr key={item._id || idx} className={idx % 2 === 0 ? "even" : "odd"}>
                                    <td>{item._id.slice(-8)}</td>
                                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                                    <td>{item.amount.toLocaleString()}</td>
                                    <td>{item.status}</td>
                                    <td>{item.bankAccount?.bankName || 'N/A'}</td>
                                    <td>{item.bankAccount?.accountNumber || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}
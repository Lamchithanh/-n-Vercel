import { useState, useEffect } from "react";
import { Copy, Check, X, Heart } from "lucide-react";
import PropTypes from "prop-types";
import { API_URL } from "../../../../server/src/config/config";

const CustomAlert = ({ children, type = "success", onClose }) => (
  <div
    className={`fixed bottom-4 right-4 w-72 p-4 rounded-lg shadow-lg
    ${
      type === "success"
        ? "bg-green-50 border border-green-200"
        : "bg-red-50 border border-red-200"
    }`}
  >
    <div className="flex items-start">
      <div className="flex-1">{children}</div>
      <button
        onClick={onClose}
        className="ml-4 text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>
    </div>
  </div>
);

CustomAlert.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(["success", "error"]),
  onClose: PropTypes.func.isRequired,
};

CustomAlert.defaultProps = {
  type: "success",
};

const RandomCoupon = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [coupon, setCoupon] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchCoupon = async () => {
    try {
      const response = await fetch(`${API_URL}/coupons/random`);
      if (response.ok) {
        const data = await response.json();
        setCoupon(data);
        checkIsFavorite(data.id);
      }
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
  };

  const checkIsFavorite = async (couponId) => {
    try {
      const response = await fetch(`${API_URL}/favorites/check/${couponId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!coupon) return;

    try {
      const method = isFavorite ? "DELETE" : "POST";
      const url = isFavorite
        ? `${API_URL}/favorites/${coupon.id}`
        : `${API_URL}/favorites`;

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body:
          method === "POST"
            ? JSON.stringify({ coupon_id: coupon.id })
            : undefined,
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        setAlertType("success");
        setAlertMessage(
          isFavorite
            ? "Đã xóa khỏi danh sách yêu thích"
            : "Đã thêm vào danh sách yêu thích"
        );
        setShowAlert(true);
      }
    } catch {
      setAlertType("error");
      setAlertMessage("Có lỗi xảy ra, vui lòng thử lại");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    const generateRandomPosition = () => {
      const maxWidth = window.innerWidth - 300;
      const maxHeight = window.innerHeight - 200;
      const randomTop = Math.max(100, Math.floor(Math.random() * maxHeight));
      const randomLeft = Math.max(20, Math.floor(Math.random() * maxWidth));
      setPosition({ top: randomTop, left: randomLeft });
    };

    const showRandomCoupon = () => {
      const randomDelay = Math.floor(Math.random() * (30000 - 10000) + 10000);
      setTimeout(() => {
        fetchCoupon();
        generateRandomPosition();
        setVisible(true);
      }, randomDelay);
    };

    showRandomCoupon();

    const hideTimeout = setTimeout(() => {
      setVisible(false);
    }, 60000);

    return () => clearTimeout(hideTimeout);
  }, []);

  const handleCopy = async () => {
    if (coupon) {
      try {
        await navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setAlertType("success");
        setAlertMessage("Đã sao chép mã giảm giá vào clipboard");
        setShowAlert(true);

        setTimeout(() => {
          setShowAlert(false);
        }, 3000);

        setTimeout(() => {
          setVisible(false);
        }, 1000);
      } catch (err) {
        console.error("Failed to copy:", err);
        setAlertType("error");
        setAlertMessage("Không thể sao chép mã giảm giá");
        setShowAlert(true);
      }
    }
  };

  if (!visible || !coupon) return null;

  return (
    <>
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl p-4 w-72"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={toggleFavorite}
            className={`p-1 rounded-full ${
              isFavorite
                ? "text-red-500 hover:text-red-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Mã giảm giá đặc biệt! 🎉
          </h3>
          <div className="bg-gray-100 p-3 rounded-md flex items-center justify-between mb-3">
            <span className="font-mono font-bold text-lg">{coupon.code}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {copied ? (
                <Check className="text-green-500" size={20} />
              ) : (
                <Copy size={20} />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Giảm {coupon.discount_amount}
            {coupon.discount_type === "percentage" ? "%" : "đ"}
          </p>
          <button
            onClick={handleCopy}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Nhận ngay
          </button>
        </div>
      </div>

      {showAlert && (
        <CustomAlert type={alertType} onClose={() => setShowAlert(false)}>
          <div className="flex items-center">
            {alertType === "success" ? (
              <Check className="w-4 h-4 text-green-500 mr-2" />
            ) : (
              <X className="w-4 h-4 text-red-500 mr-2" />
            )}
            <div>
              <div className="font-semibold">
                {alertType === "success" ? "Thành công!" : "Lỗi!"}
              </div>
              <div className="text-sm">{alertMessage}</div>
            </div>
          </div>
        </CustomAlert>
      )}
    </>
  );
};

export default RandomCoupon;

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { API_URL } from "../../../../server/src/config/config";
import {
  TicketPercent,
  TagIcon,
  CalendarIcon,
  GiftIcon,
  CopyIcon,
} from "lucide-react";
import "./MyCouponsPage.scss";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";

const CouponCard = ({ coupon }) => {
  const [copied, setCopied] = useState(false);

  const getCardClassName = () => {
    if (coupon.is_expired) return "coupon-card coupon-card--expired";
    if (coupon.is_used) return "coupon-card coupon-card--used";
    return "coupon-card coupon-card--available";
  };

  const getDiscountDisplay = () => {
    return coupon.discount_type === "percentage"
      ? `${coupon.discount_amount}%`
      : `${coupon.discount_amount.toLocaleString("vi-VN")} đ`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy coupon code:", err);
    }
  };

  return (
    <>
      <div className={getCardClassName()}>
        <div className="coupon-card__header">
          <div
            className="coupon-card__header-code"
            onClick={handleCopyCode}
            title="Click to copy coupon code"
          >
            <TicketPercent size={24} />
            <span>{coupon.code}</span>
            <CopyIcon size={18} className="coupon-card__header-copy-icon" />
            {copied && (
              <span className="coupon-card__header-copy-tooltip">
                Đã sao chép
              </span>
            )}
          </div>

          <div
            className={`coupon-card__header-status ${
              coupon.is_used
                ? "coupon-card__header-status--used"
                : "coupon-card__header-status--available"
            }`}
          >
            {coupon.is_used ? "Đã sử dụng" : "Chưa sử dụng"}
          </div>
        </div>

        <div className="coupon-card__content">
          <div className="coupon-card__content-discount">
            <TagIcon size={18} />
            <span>Giảm {getDiscountDisplay()}</span>
          </div>

          <div className="coupon-card__content-details">
            <GiftIcon size={18} />
            {coupon.min_purchase_amount ? (
              <span>
                Đơn tối thiểu:{" "}
                {coupon.min_purchase_amount.toLocaleString("vi-VN")} đ
              </span>
            ) : (
              <span>Áp dụng cho tất cả</span>
            )}
          </div>

          {coupon.expiration_date && (
            <div className="coupon-card__content-details">
              <CalendarIcon size={18} />
              <span>
                Hết hạn:{" "}
                {new Date(coupon.expiration_date).toLocaleDateString("vi-VN")}
              </span>
            </div>
          )}

          <div className="text-sm text-gray-500 mt-2">
            Tiết kiệm tối đa:{" "}
            {coupon.calculated_discount.toLocaleString("vi-VN")}đ
          </div>
        </div>
      </div>
    </>
  );
};

CouponCard.propTypes = {
  coupon: PropTypes.shape({
    id: PropTypes.number.isRequired,
    code: PropTypes.string.isRequired,
    is_expired: PropTypes.bool,
    is_used: PropTypes.bool,
    discount_type: PropTypes.oneOf(["percentage", "fixed"]).isRequired,
    discount_amount: PropTypes.number.isRequired,
    min_purchase_amount: PropTypes.number,
    expiration_date: PropTypes.string,
    calculated_discount: PropTypes.number.isRequired,
  }).isRequired,
};

const MyCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMyCoupons = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      if (!userId) {
        console.error("Không tìm thấy userId");
        return;
      }

      const response = await axios.get(`${API_URL}/mycoupons/${userId}`);
      setCoupons(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách coupon:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCoupons();
  }, []);

  const checkCouponUsage = async (couponId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id; // Lấy userId từ thông tin người dùng trong localStorage

      if (!userId) {
        console.error("Không tìm thấy userId");
        return false;
      }

      const response = await axios.get(
        `${API_URL}/mycoupons/checkCouponUsage`,
        {
          params: {
            userId,
            couponId,
          },
        }
      );
      return response.data.is_used;
    } catch (error) {
      console.error("Lỗi kiểm tra mã giảm giá:", error);
      return false;
    }
  };

  useEffect(() => {
    const fetchCouponsWithUsage = async () => {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      if (!userId) {
        console.error("Không tìm thấy userId");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/mycoupons/${userId}`);
        const couponsWithUsage = await Promise.all(
          response.data.map(async (coupon) => {
            const isUsed = await checkCouponUsage(coupon.id);
            return { ...coupon, is_used: isUsed };
          })
        );
        setCoupons(couponsWithUsage);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách coupon:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCouponsWithUsage();
  }, []);

  if (loading)
    return (
      <div className="loading-spinner">
        <div className="loading-spinner__icon"></div>
      </div>
    );

  return (
    <div className="my-coupons__container">
      <p>
        <Button
          className="btn-back"
          onClick={() => navigate(-1)}
          style={{ margin: 10 }}
        >
          <span className="btn_back">
            <LeftOutlined />{" "}
          </span>
        </Button>

        <div className="my-coupons__header">
          <TicketPercent className="my-coupons__header-icon" size={32} />
          <h2 className="my-coupons__header-title">Mã giảm giá của tôi</h2>
        </div>
      </p>

      {coupons.length === 0 ? (
        <div className="my-coupons__empty-state">
          <GiftIcon className="my-coupons__empty-state-icon" size={64} />
          <p className="my-coupons__empty-state-message">
            Bạn chưa có mã giảm giá nào
          </p>
        </div>
      ) : (
        <div className="my-coupons__grid">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoupons;

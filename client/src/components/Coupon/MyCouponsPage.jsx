import React, { useEffect, useState } from "react";
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
    if (coupon.is_expired || coupon.is_used) {
      return; // Không sao chép mã nếu coupon đã hết hạn hoặc đã sử dụng
    }

    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy coupon code:", err);
    }
  };

  return (
    <div className={getCardClassName()}>
      <div className="coupon-card__header">
        <div
          className="coupon-card__header-code"
          onClick={handleCopyCode}
          title="Click to copy coupon code"
          style={
            coupon.is_expired || coupon.is_used
              ? { cursor: "not-allowed", opacity: 0.5, userSelect: "none" }
              : {}
          }
        >
          <TicketPercent size={24} />
          <span
            style={
              coupon.is_expired || coupon.is_used ? { userSelect: "none" } : {}
            }
          >
            {coupon.code}
          </span>
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
              : coupon.is_expired
              ? "coupon-card__header-status--expired"
              : "coupon-card__header-status--available"
          }`}
        >
          {coupon.is_used
            ? "Đã sử dụng"
            : coupon.is_expired
            ? "Đã hết hạn"
            : "Chưa sử dụng"}
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

        <div className="coupon-card__content-details text-sm text-gray-500 mt-2">
          Tiết kiệm tối đa: {coupon.calculated_discount.toLocaleString("vi-VN")}{" "}
          đ
        </div>
      </div>
    </div>
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

      const couponsWithStatus = await Promise.all(
        response.data.map(async (coupon) => {
          try {
            const isExpired = coupon.expiration_date
              ? new Date(coupon.expiration_date) < new Date()
              : false;

            const statusResponse = await axios.get(
              `${API_URL}/mycoupons/checkCouponStatus`,
              {
                params: {
                  userId: userId,
                  couponId: coupon.id,
                },
              }
            );

            return {
              ...coupon,
              is_expired: isExpired || statusResponse.data.is_expired,
              is_used: statusResponse.data.is_used,
            };
          } catch (error) {
            console.error(
              `Lỗi kiểm tra trạng thái coupon ${coupon.id}:`,
              error
            );
            return coupon;
          }
        })
      );

      setCoupons(couponsWithStatus);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách coupon:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCoupons();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="loading-spinner__icon"></div>
      </div>
    );
  }

  const renderUsageDetails = (coupon) => {
    if (
      coupon.is_used &&
      coupon.usage_details &&
      coupon.usage_details.length > 0
    ) {
      const usageDetail = coupon.usage_details[0]; // Giả sử một mã giảm giá chỉ dùng cho một khóa
      return (
        coupon.is_used &&
        coupon.usage_details && (
          <div className="coupon-card__content-usage-details">
            {coupon.usage_details.map((usageDetail) => (
              <div
                key={usageDetail.id}
                className="coupon-card__content-usage-course"
              >
                <img
                  src={usageDetail.course_thumbnail}
                  alt={usageDetail.course_title}
                  className="coupon-card__content-usage-thumbnail"
                />
                <div className="coupon-card__content-usage-info">
                  <p className="coupon-card__content-usage-course-title">
                    {usageDetail.course_title}
                  </p>
                  <p className="coupon-card__content-usage-date">
                    Đã sử dụng vào:{" "}
                    {new Date(usageDetail.created_at).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                  <p className="coupon-card__content-usage-discount">
                    Giảm giá:{" "}
                    {usageDetail.discount_amount.toLocaleString("vi-VN")} đ
                    {` (Từ ${usageDetail.original_amount.toLocaleString(
                      "vi-VN"
                    )} đ)`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      );
    }
  };

  return (
    <div className="my-coupons__container">
      <div>
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
      </div>

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
            <div key={coupon.id}>
              <CouponCard coupon={coupon} />
              {renderUsageDetails(coupon)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoupons;

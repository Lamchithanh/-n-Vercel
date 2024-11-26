import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Input, Button, message, Space, Tag } from "antd";
import { TagOutlined, CloseOutlined } from "@ant-design/icons";
import { API_URL } from "../../../../server/src/config/config";

const CouponInput = ({
  onApplyCoupon,
  onRemoveCoupon,
  coursePrice,
  courseId,
  userId,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const fetchedRef = useRef(false);

  // Validate coupon with the backend
  const validateCoupon = async (code) => {
    try {
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim(),
          totalAmount: coursePrice,
          userId,
          courseId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || "Không thể kiểm tra mã giảm giá");
    }
  };

  // Apply coupon to the backend
  const applyCouponToBackend = async (couponData) => {
    try {
      const response = await fetch(`${API_URL}/coupons/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: couponData.code,
          userId,
          courseId,
          coursePrice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || "Không thể áp dụng mã giảm giá");
    }
  };

  // Fetch applied coupon from the backend
  const fetchAppliedCoupon = useCallback(async () => {
    if (fetchedRef.current || isFetching || !userId || !courseId) return;

    setIsFetching(true);
    try {
      const response = await fetch(
        `${API_URL}/coupons/get-applied?userId=${userId}&courseId=${courseId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Không thể lấy thông tin mã giảm giá");

      const couponData = await response.json();
      if (couponData.length > 0) {
        const appliedCoupon = couponData[0];
        setAppliedCoupon({
          code: appliedCoupon.code,
          type: appliedCoupon.discount_type,
          discount: appliedCoupon.discount_amount,
          calculatedDiscount: appliedCoupon.discount_amount,
        });
        onApplyCoupon({
          code: appliedCoupon.code,
          type: appliedCoupon.discount_type,
          discount: appliedCoupon.discount_amount,
          calculatedDiscount: appliedCoupon.discount_amount,
        });
      }

      fetchedRef.current = true;
    } catch (error) {
      console.error("Lỗi khi lấy mã giảm giá: ", error.message);
    } finally {
      setIsFetching(false);
    }
  }, [userId, courseId, onApplyCoupon, isFetching]);

  useEffect(() => {
    fetchAppliedCoupon();
  }, [fetchAppliedCoupon]);

  // Remove applied coupon
  const handleRemoveCoupon = async () => {
    try {
      const response = await fetch(`${API_URL}/coupons/remove-usage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          courseId,
          couponId: appliedCoupon.couponId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setAppliedCoupon(null);
      onRemoveCoupon();
      setCouponCode("");
      message.success("Mã giảm giá đã được gỡ bỏ");
    } catch (error) {
      message.error(error.message || "Lỗi khi gỡ bỏ mã giảm giá");
    }
  };

  // Handle coupon input change
  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
  };

  // Handle apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      message.error("Vui lòng nhập mã giảm giá.");
      return;
    }

    setLoading(true);
    try {
      const couponData = await validateCoupon(couponCode);
      const appliedData = await applyCouponToBackend(couponData);

      setAppliedCoupon(appliedData);
      onApplyCoupon(appliedData);
      message.success("Mã giảm giá đã được áp dụng thành công!");
    } catch (error) {
      message.error(error.message || "Lỗi server, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      {!appliedCoupon ? (
        <Space.Compact style={{ width: "100%", marginBottom: "16px" }}>
          <Input
            id="coupon-input"
            name="coupon-input"
            aria-label="Nhập mã giảm giá"
            prefix={<TagOutlined className="text-gray-400" />}
            placeholder="Nhập mã giảm giá"
            value={couponCode}
            onChange={handleCouponChange}
            onPressEnter={handleApplyCoupon}
            maxLength={20}
            disabled={loading}
          />
          <Button
            type="primary"
            onClick={handleApplyCoupon}
            loading={loading}
            disabled={loading}
            aria-label="Áp dụng mã giảm giá"
          >
            Áp dụng
          </Button>
        </Space.Compact>
      ) : (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <TagOutlined className="text-blue-500" />
            <span className="font-medium">
              Mã giảm giá: {appliedCoupon.code}
              <Tag color="blue" className="ml-2">
                {appliedCoupon.type === "percentage"
                  ? `Giảm ${appliedCoupon.discount}%`
                  : `Giảm ${appliedCoupon.discount.toLocaleString()}.000 VND`}
              </Tag>
            </span>
          </div>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleRemoveCoupon}
            className="text-gray-500 hover:text-red-500"
            aria-label="Gỡ bỏ mã giảm giá"
          />
        </div>
      )}
    </div>
  );
};

CouponInput.propTypes = {
  onApplyCoupon: PropTypes.func.isRequired,
  onRemoveCoupon: PropTypes.func.isRequired,
  coursePrice: PropTypes.number.isRequired,
  courseId: PropTypes.number.isRequired,
  userId: PropTypes.number.isRequired,
};

export default CouponInput;

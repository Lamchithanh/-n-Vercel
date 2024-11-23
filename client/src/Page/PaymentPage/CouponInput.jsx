import { useState, useEffect } from "react";
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
  const [isValidating, setIsValidating] = useState(false);

  const storageKey = `applied_coupon_${userId}_${courseId}`;

  useEffect(() => {
    const savedCoupon = localStorage.getItem(storageKey);
    if (savedCoupon && !appliedCoupon) {
      try {
        const couponData = JSON.parse(savedCoupon);
        setAppliedCoupon(couponData);
        onApplyCoupon(couponData);
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey, onApplyCoupon]);

  const validateCoupon = async (code) => {
    if (isValidating) return null;

    try {
      setIsValidating(true);
      const response = await fetch(`${API_URL}/coupons/check-coupon`, {
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
    } finally {
      setIsValidating(false);
    }
  };

  const calculateDiscount = (couponData) => {
    const { discountType, discountAmount } = couponData;
    let calculatedDiscount = 0;

    if (discountType === "percentage") {
      calculatedDiscount = (coursePrice * discountAmount) / 100;
    } else if (discountType === "fixed") {
      calculatedDiscount = discountAmount;
    }

    return Math.min(calculatedDiscount, coursePrice);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning("Vui lòng nhập mã giảm giá");
      return;
    }

    // Prevent duplicate API calls if already loading or if coupon is already applied
    if (
      loading ||
      isValidating ||
      (appliedCoupon && appliedCoupon.code === couponCode.trim())
    ) {
      return;
    }

    try {
      setLoading(true);
      const couponData = await validateCoupon(couponCode);

      if (!couponData) return;

      const calculatedDiscount = calculateDiscount(couponData);

      const finalCouponData = {
        code: couponData.code,
        type: couponData.discountType,
        discount: couponData.discountAmount,
        calculatedDiscount,
        couponId: couponData.couponId,
      };

      localStorage.setItem(storageKey, JSON.stringify(finalCouponData));
      setAppliedCoupon(finalCouponData);
      onApplyCoupon(finalCouponData);
      message.success(`Áp dụng mã giảm giá thành công: ${couponData.code}`);
      setCouponCode("");
    } catch (error) {
      message.error(error.message || "Không thể áp dụng mã giảm giá");
      onApplyCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    localStorage.removeItem(storageKey);
    setAppliedCoupon(null);
    onRemoveCoupon();
    setCouponCode("");
  };

  return (
    <div className="mb-6">
      {!appliedCoupon ? (
        <Space.Compact style={{ width: "100%", marginBottom: "16px" }}>
          <Input
            prefix={<TagOutlined className="text-gray-400" />}
            placeholder="Nhập mã giảm giá"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onPressEnter={handleApplyCoupon}
            maxLength={20}
            disabled={loading || isValidating}
          />
          <Button
            type="primary"
            onClick={handleApplyCoupon}
            loading={loading || isValidating}
            disabled={loading || isValidating}
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

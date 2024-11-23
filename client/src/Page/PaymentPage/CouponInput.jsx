import { useState } from "react";
import PropTypes from "prop-types";
import { Input, Button, message, Space, Tag } from "antd";
import { TagOutlined, CloseOutlined } from "@ant-design/icons";
import { API_URL } from "../../../../server/src/config/config";

const CouponInput = ({ onApplyCoupon, onRemoveCoupon, coursePrice }) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const validateCoupon = async (code) => {
    try {
      const response = await fetch(`${API_URL}/coupons/check-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim(),
          totalAmount: coursePrice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message || "Không thể kiểm tra mã giảm giá");
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

    // Ensure discount doesn't exceed course price
    return Math.min(calculatedDiscount, coursePrice);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      setLoading(true);
      const couponData = await validateCoupon(couponCode);
      const calculatedDiscount = calculateDiscount(couponData);

      const finalCouponData = {
        code: couponData.code,
        type: couponData.discountType,
        discount: couponData.discountAmount,
        calculatedDiscount,
      };

      setAppliedCoupon(finalCouponData);

      const discountText =
        finalCouponData.type === "percentage"
          ? `${finalCouponData.discount}%`
          : `${finalCouponData.discount.toLocaleString()}0 VND`;

      message.success(`Áp dụng mã giảm giá thành công: ${discountText}`);
      onApplyCoupon(finalCouponData);
      setCouponCode("");
    } catch (error) {
      message.error(error.message || "Không thể áp dụng mã giảm giá");
      onApplyCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
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
          />
          <Button type="primary" onClick={handleApplyCoupon} loading={loading}>
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
};

export default CouponInput;

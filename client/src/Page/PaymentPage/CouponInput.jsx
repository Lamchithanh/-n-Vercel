import { useState } from "react";
import PropTypes from "prop-types";
import { Input, Button, message, Space, Tag } from "antd";
import { TagOutlined, CloseOutlined } from "@ant-design/icons";
import { API_URL } from "../../../../server/src/config/config";

const CouponInput = ({ onApplyCoupon, onRemoveCoupon, coursePrice }) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const checkCoupon = async (code) => {
    const response = await fetch(`${API_URL}/coupons/check-coupon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        totalAmount: coursePrice,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const couponData = await response.json();
    return couponData;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      setLoading(true);
      const couponData = await checkCoupon(couponCode);

      setAppliedCoupon({
        code: couponData.code,
        type: couponData.discountType,
        discount: couponData.discountAmount,
      });

      const discountText =
        couponData.discountType === "percentage"
          ? `${couponData.discountAmount}%`
          : `${couponData.discountAmount.toLocaleString()}.000 VND`;

      message.success(`Áp dụng mã giảm giá thành công: ${discountText}`);
      onApplyCoupon(couponData);
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

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
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Hàm gửi coupon đã áp dụng lên backend để lưu
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

  // Lấy thông tin mã giảm giá đã áp dụng
  useEffect(() => {
    const fetchAppliedCoupon = async () => {
      if (!userId || !courseId || isFetching || isInitialized) return;
      setIsFetching(true);
      try {
        const response = await fetch(`${API_URL}/coupons/get-applied`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Không thể lấy thông tin mã giảm giá");
        }

        const couponData = await response.json();
        if (couponData) {
          setAppliedCoupon(couponData);
          onApplyCoupon(couponData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy mã giảm giá: ", error.message);
      } finally {
        setIsFetching(false);
        setIsInitialized(true);
      }
    };

    fetchAppliedCoupon();
  }, [userId, courseId, isInitialized]);

  // Kiểm tra tính hợp lệ của mã giảm giá
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

  // Tính toán mức giảm giá
  const calculateDiscount = (couponData) => {
    const { discountType, discountAmount } = couponData;
    return discountType === "percentage"
      ? Math.min((coursePrice * discountAmount) / 100, coursePrice)
      : Math.min(discountAmount, coursePrice);
  };

  // Áp dụng mã giảm giá
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning("Vui lòng nhập mã giảm giá");
      return;
    }

    if (
      loading ||
      (appliedCoupon && appliedCoupon.code === couponCode.trim())
    ) {
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
        couponId: couponData.couponId,
      };

      await applyCouponToBackend(finalCouponData);

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

  // Gỡ bỏ mã giảm giá
  const handleRemoveCoupon = async () => {
    try {
      const response = await fetch(`${API_URL}/coupons/remove-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          courseId,
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
    } catch {
      message.error("Lỗi khi gỡ bỏ mã giảm giá");
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
            onChange={(e) => setCouponCode(e.target.value)}
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

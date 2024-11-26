import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Input, Button, message, Space, Tag } from "antd";
import { TagOutlined, CloseOutlined } from "@ant-design/icons";
import { API_URL } from "../../../../server/src/config/config";
import debounce from "lodash/debounce";

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
  // const fetchedRef = useRef(false);
  const abortControllerRef = useRef(null);
  // Validate coupon with the backend
  const validateCoupon = async (code) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Hủy yêu cầu trước đó nếu có
    }
    abortControllerRef.current = new AbortController(); // Tạo AbortController mới

    try {
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: "POST",
        signal: abortControllerRef.current.signal, // Kết nối AbortController với yêu cầu
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim(), // Lọc khoảng trắng thừa ở đầu và cuối mã
          totalAmount: coursePrice, // Giá trị đơn hàng
          userId,
          courseId,
        }),
      });

      // Kiểm tra xem phản hồi có thành công không
      if (!response.ok) {
        const error = await response.json(); // Lấy thông báo lỗi từ backend
        throw new Error(error.message || "Lỗi khi kiểm tra mã giảm giá.");
      }

      // Trả về kết quả từ backend
      const result = await response.json();
      return result; // Dữ liệu mã giảm giá hợp lệ
    } catch (error) {
      // Quản lý lỗi
      if (error.name === "AbortError") {
        console.log("Request was cancelled");
        return null; // Trả về null nếu yêu cầu bị hủy
      }
      throw new Error(error.message || "Không thể kiểm tra mã giảm giá"); // Thông báo lỗi khác
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
  const fetchAppliedCoupon = useCallback(
    debounce(async () => {
      if (isFetching || !userId || !courseId) return;

      setIsFetching(true);

      try {
        const response = await fetch(
          `${API_URL}/coupons/get-applied?userId=${userId}&courseId=${courseId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy thông tin mã giảm giá");
        }

        const couponData = await response.json();

        if (couponData && couponData.length > 0) {
          const appliedCoupon = couponData[0];
          const normalizedCoupon = {
            code: appliedCoupon.code,
            type: appliedCoupon.discount_type,
            discount: parseFloat(appliedCoupon.discount_amount),
            calculatedDiscount: parseFloat(appliedCoupon.discount_amount),
          };

          setAppliedCoupon(normalizedCoupon);
          onApplyCoupon(normalizedCoupon);
        } else {
          // Không có mã giảm giá nào được áp dụng
          setAppliedCoupon(null);
          onRemoveCoupon();
        }
      } catch (error) {
        console.error("Lỗi khi lấy mã giảm giá: ", error.message);
      } finally {
        setIsFetching(false);
      }
    }, 500), // Debounce thời gian 500ms
    [userId, courseId, onApplyCoupon, onRemoveCoupon, isFetching]
  );

  useEffect(() => {
    if (isFetching || appliedCoupon) return;

    fetchAppliedCoupon();

    return () => {
      fetchAppliedCoupon.cancel(); // Hủy debounce khi component unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAppliedCoupon, isFetching, appliedCoupon]);

  useEffect(() => {
    if (appliedCoupon) {
      onApplyCoupon(appliedCoupon);
    }
  }, [appliedCoupon, onApplyCoupon]);
  // Remove applied coupon
  const handleRemoveCoupon = async () => {
    if (!appliedCoupon || !appliedCoupon.couponId) {
      message.error("Không có mã giảm giá nào để gỡ bỏ.");
      return;
    }

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

  // Handle apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      message.error("Vui lòng nhập mã giảm giá.");
      return;
    }

    setLoading(true);
    try {
      // Validate coupon first
      const couponData = await validateCoupon(couponCode);
      if (!couponData || !couponData.code) {
        // message.error("Mã giảm giá không hợp lệ.");
        return;
      }

      // Apply coupon and get applied data
      const appliedData = await applyCouponToBackend(couponData);
      if (!appliedData || !appliedData.code) {
        throw new Error("Không thể áp dụng mã giảm giá.");
      }

      // Standardize coupon object structure
      const normalizedCoupon = {
        code: appliedData.code || couponCode,
        type: appliedData.discountType || couponData.type,
        discount: parseFloat(
          appliedData.discountAmount || couponData.discount || 0
        ),
        calculatedDiscount: parseFloat(
          appliedData.discountAmount || couponData.discount || 0
        ),
        couponId: couponData.couponId || appliedData.couponId, // Add coupon ID for removal
      };

      // Validate normalized coupon data
      if (isNaN(normalizedCoupon.discount) || normalizedCoupon.discount <= 0) {
        throw new Error("Giá trị giảm giá không hợp lệ.");
      }

      // Set and propagate coupon data immediately
      setAppliedCoupon(normalizedCoupon);

      message.success("Mã giảm giá đã được áp dụng thành công!");
    } catch (error) {
      console.error("Coupon Application Error:", error);
      message.error(
        error.message ||
          "Không thể áp dụng mã giảm giá. Vui lòng kiểm tra và thử lại."
      );

      // Reset coupon state on error
      setAppliedCoupon(null);
      onRemoveCoupon();
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

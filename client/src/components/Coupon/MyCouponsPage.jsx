import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../../server/src/config/config";

const MyCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyCoupons = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const response = await axios.get(`${API_URL}/mycoupons/${userId}`, {
          params: { userId },
        });

        console.log(response.data); // Kiểm tra dữ liệu trả về từ API
        setCoupons(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách coupon:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCoupons();
  }, []);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Mã giảm giá của tôi</h2>
      <div className="space-y-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`border p-4 rounded-lg ${
              coupon.is_expired ? "bg-gray-100" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold">{coupon.code}</span>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  coupon.is_used
                    ? "bg-gray-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {coupon.is_used ? "Đã sử dụng" : "Chưa sử dụng"}
              </span>
            </div>

            <div className="text-lg font-semibold text-red-600">
              {coupon.discount_type === "percentage"
                ? `Giảm ${coupon.discount_amount}%`
                : `Giảm ${coupon.discount_amount.toLocaleString()}đ`}
            </div>

            {coupon.min_purchase_amount && (
              <div className="text-sm text-gray-600">
                Đơn tối thiểu: {coupon.min_purchase_amount.toLocaleString()}đ
              </div>
            )}

            {coupon.expiration_date && (
              <div className="text-sm text-gray-600">
                Hết hạn:{" "}
                {new Date(coupon.expiration_date).toLocaleDateString("vi-VN")}
              </div>
            )}

            <div className="mt-2 text-sm">
              Tiết kiệm tối đa: {coupon.calculated_discount.toLocaleString()}đ
            </div>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="text-center text-gray-500">
            Bạn chưa có mã giảm giá nào
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoupons;

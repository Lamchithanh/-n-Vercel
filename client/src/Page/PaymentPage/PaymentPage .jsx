import { Card, Button, Row, Col, Typography, message, Divider } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { fetchCourseById } from "../../../../server/src/Api/courseApi";
import { fetchModulesAPI } from "../../../../server/src/Api/moduleApi";
import { fetchLessonsAPI } from "../../../../server/src/Api/lessonApi";
import defaultImage from "../../assets/img/sach.png";
import Loader from "../../context/Loader";
import PaymentQRModal from "./ModalQR"; // Import the new modal component
import {
  ClockCircleOutlined,
  BookOutlined,
  VideoCameraOutlined,
  ShoppingOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import {
  checkPaymentStatusAPI,
  confirmPayment,
  initiatePayment,
} from "../../../../server/src/Api/paymentApi";
import PropTypes from "prop-types";
import CouponInput from "./CouponInput";
import "./Payment.scss";
const { Title, Text } = Typography;

// Define valid payment methods according to database schema
const PAYMENT_METHODS = {
  paypal: {
    key: "paypal",
    label: "Mã QR",
    icon: <QrcodeOutlined />,
  },
};

const PaymentMethodSelector = ({ onMethodSelect, selectedMethod }) => {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {Object.values(PAYMENT_METHODS).map((method) => (
        <Button
          key={method.key}
          type={selectedMethod === method.key ? "primary" : "default"}
          onClick={() => onMethodSelect(method.key)}
          style={{
            height: "auto",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {method.icon}
          {method.label}
        </Button>
      ))}
    </div>
  );
};

const PaymentPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [hasHandledPaymentCheck, setHasHandledPaymentCheck] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);

  // New state for QR Modal
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });

  const calculatePrices = useCallback((basePrice, couponData) => {
    if (!couponData) {
      return {
        finalPrice: basePrice,
        discount: 0,
      };
    }

    let discountAmount = 0;

    // Handle percentage discount
    if (couponData.type === "percentage") {
      const percentageDiscount = parseFloat(couponData.discount || 0);
      discountAmount = Math.min(
        (basePrice * percentageDiscount) / 100, // Calculate percentage discount
        basePrice // Ensure discount doesn't exceed course price
      );
    }
    // Handle fixed amount discount
    else {
      const fixedDiscount = parseFloat(couponData.discount || 0);
      discountAmount = Math.min(
        fixedDiscount, // Fixed discount amount
        basePrice // Ensure discount doesn't exceed course price
      );
    }

    // Ensure non-negative values
    discountAmount = Math.max(0, discountAmount);
    const finalPrice = Math.max(0, basePrice - discountAmount);

    return {
      finalPrice,
      discount: discountAmount,
    };
  }, []);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        setCurrentUser(user);

        if (user && !hasHandledPaymentCheck) {
          const paymentStatus = await checkPaymentStatusAPI(user.id, courseId);
          const fromPaymentPage = new URLSearchParams(
            window.location.search
          ).get("fromPaymentPage");

          if (paymentStatus.hasPaid && !fromPaymentPage) {
            message.info("Quay lại khóa học sớm nhé.");
            navigate(`/courses/${courseId}?fromPaymentPage=true`, {
              replace: true,
            });
            setHasHandledPaymentCheck(true);
            return;
          }
        }

        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);

        const initialPrice = Number(courseData.price) || 0;
        const {
          finalPrice: calculatedFinalPrice,
          discount: calculatedDiscount,
        } = calculatePrices(initialPrice, null);
        setFinalPrice(calculatedFinalPrice);
        setDiscount(calculatedDiscount);

        const modulesData = await fetchModulesAPI(courseId);
        setModules(modulesData);

        let lessonCount = 0;
        let duration = 0;

        for (const module of modulesData) {
          const lessonsData = await fetchLessonsAPI(module.id);
          lessonCount += lessonsData.length;
          duration += lessonsData.reduce(
            (total, lesson) => total + (lesson.duration || 0),
            0
          );
        }

        setTotalLessons(lessonCount);
        setTotalDuration(duration);
      } catch (error) {
        message.error("Không thể tải thông tin khóa học");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, navigate, hasHandledPaymentCheck, calculatePrices]);

  useEffect(() => {
    if (!course?.price) return;

    const basePrice = parseFloat(course.price);
    const { finalPrice: newFinalPrice, discount: newDiscount } =
      calculatePrices(basePrice, appliedCoupon);

    setFinalPrice(newFinalPrice);
    setDiscount(newDiscount);
  }, [course?.price, appliedCoupon, calculatePrices]);

  const handleConfirmPayment = async () => {
    if (!validateSelection()) return;

    if (!currentUser) {
      message.error("Vui lòng đăng nhập để thanh toán");
      return;
    }

    try {
      setLoading(true);
      const initiateResponse = await initiatePayment({
        userId: currentUser.id,
        courseId,
        amount: finalPrice,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });

      // Store payment ID for QR modal
      setPaymentId(initiateResponse.paymentId);

      // For QR payment method, show QR modal instead of direct confirmation
      if (paymentMethod === "paypal") {
        setIsQRModalVisible(true);
      } else {
        const mockTransactionId = `TRANS_${Date.now()}`;
        await confirmPayment(initiateResponse.paymentId, mockTransactionId);

        message.success("Thanh toán thành công!");
        navigate(`/courses/${courseId}?fromPaymentPage=true`);
      }
    } catch (error) {
      message.error(
        error.message || "Có lỗi xảy ra trong quá trình thanh toán"
      );
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQRModal = () => {
    setIsQRModalVisible(false);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const validateSelection = () => {
    if (
      !paymentMethod ||
      !Object.keys(PAYMENT_METHODS).includes(paymentMethod)
    ) {
      message.error("Vui lòng chọn phương thức thanh toán hợp lệ!");
      return false;
    }
    return true;
  };

  const convertMinutesToHMS = (totalMinutes) => {
    if (!totalMinutes) return "0h 0p";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h${minutes}p`;
  };

  if (loading) return <Loader />;
  if (!course) return <div>Không tìm thấy khóa học</div>;

  const getResponsiveLayout = () => {
    if (isMobile) {
      return { mainCol: 24, sideCol: 24, imageCol: 24, infoCol: 24 };
    }
    if (isTablet) {
      return { mainCol: 16, sideCol: 8, imageCol: 12, infoCol: 12 };
    }
    return { mainCol: 16, sideCol: 8, imageCol: 8, infoCol: 16 };
  };

  const layout = getResponsiveLayout();

  const PriceBreakdown = () => {
    const coursePrice = parseFloat(course?.price || 0);
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!userId) {
      message.error(
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      return null;
    }

    return (
      <div
        style={{ background: "#fafafa", padding: "20px", borderRadius: "8px" }}
      >
        {currentUser && (
          <PaymentQRModal
            visible={isQRModalVisible}
            onClose={handleCloseQRModal}
            userId={currentUser.id}
            courseId={courseId}
            amount={finalPrice}
            paymentId={paymentId}
          />
        )}
        <CouponInput
          onApplyCoupon={setAppliedCoupon}
          onRemoveCoupon={() => setAppliedCoupon(null)}
          coursePrice={coursePrice}
          courseId={courseId}
          userId={userId}
        />
        <Row justify="space-between" style={{ marginBottom: "12px" }}>
          <Text strong style={{ fontSize: isMobile ? "14px" : "16px" }}>
            Giá khóa học:
          </Text>
          <Text strong style={{ fontSize: isMobile ? "14px" : "16px" }}>
            {(Number(course?.price) || 0).toLocaleString()} VND
          </Text>
        </Row>

        {discount > 0 && (
          <Row justify="space-between" style={{ marginBottom: "12px" }}>
            <Text
              strong
              style={{ fontSize: isMobile ? "14px" : "16px", color: "#52c41a" }}
            >
              Giảm giá:
            </Text>
            <Text
              strong
              style={{ fontSize: isMobile ? "14px" : "16px", color: "#52c41a" }}
            >
              -{Number(discount).toLocaleString()} VND
            </Text>
          </Row>
        )}

        <Divider style={{ margin: "12px 0" }} />

        <Row justify="space-between">
          <Text strong style={{ fontSize: isMobile ? "16px" : "18px" }}>
            Tổng thanh toán:
          </Text>
          <Text
            strong
            style={{ color: "#ff4d4f", fontSize: isMobile ? "20px" : "24px" }}
          >
            {Number(finalPrice).toLocaleString()} VND
          </Text>
        </Row>
      </div>
    );
  };

  return (
    <div className="playout_payment">
      <div
        className="container payment_content "
        style={{
          padding: isMobile ? "20px 10px" : "40px 20px",
          minHeight: "100vh",
        }}
      >
        <div className="header_payment">
          <Button
            onClick={() => navigate(-1)}
            style={{
              marginBottom: "20px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ← Quay lại
          </Button>
          <h2>
            Payment <ShoppingOutlined className="shoppe_payment" />
          </h2>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={layout.mainCol}>
            <Card
              title={
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                  <span className="text_payment"> Thông tin thanh toán</span>
                </Title>
              }
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ padding: isMobile ? "10px" : "20px" }}>
                <Row
                  gutter={[24, 24]}
                  align="middle"
                  style={{ marginBottom: "30px" }}
                >
                  <Col span={layout.imageCol}>
                    <img
                      src={course.image || defaultImage}
                      alt={course.title}
                      style={{
                        width: "100%",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                  </Col>
                  <Col span={layout.infoCol}>
                    <Title
                      level={4}
                      style={{ marginBottom: "16px", color: "#f05a28" }}
                    >
                      {course.title}
                    </Title>
                    <Text
                      style={{
                        fontSize: isMobile ? "14px" : "16px",
                        color: "#595959",
                        display: "block",
                        marginBottom: "20px",
                      }}
                    >
                      {course.description}
                    </Text>

                    <Row className="list_totalcourses" gutter={[12, 12]}>
                      <Col classname="list_item_child" span={isMobile ? 24 : 8}>
                        <div
                          className="item_child"
                          style={{
                            textAlign: "center",
                            padding: "12px",
                            background: "#242145",
                            borderRadius: "8px",
                          }}
                        >
                          <BookOutlined
                            style={{
                              fontSize: "24px",
                              color: "#1890ff",
                              marginBottom: "8px",
                            }}
                          />
                          <div style={{ fontWeight: "bold", color: "#e6356f" }}>
                            {modules.length} chương
                          </div>
                        </div>
                      </Col>
                      <Col classname="list_item_child" span={isMobile ? 24 : 8}>
                        <div
                          className="item_child"
                          style={{
                            textAlign: "center",
                            padding: "12px",
                            background: "#242145",
                            borderRadius: "8px",
                          }}
                        >
                          <VideoCameraOutlined
                            style={{
                              fontSize: "24px",
                              color: "#52c41a",
                              marginBottom: "8px",
                            }}
                          />
                          <div style={{ fontWeight: "bold", color: "#e6356f" }}>
                            {totalLessons} bài học
                          </div>
                        </div>
                      </Col>
                      <Col classname="list_item_child" span={isMobile ? 24 : 8}>
                        <div
                          className="item_child"
                          style={{
                            textAlign: "center",
                            padding: "12px",
                            background: "#242145",
                            borderRadius: "8px",
                          }}
                        >
                          <ClockCircleOutlined
                            style={{
                              fontSize: "24px",
                              color: "#fa8c16",
                              marginBottom: "8px",
                            }}
                          />
                          <div style={{ fontWeight: "bold", color: "#e6356f" }}>
                            {convertMinutesToHMS(totalDuration)}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Divider style={{ margin: "24px 0" }} />
                <PriceBreakdown />
              </div>
            </Card>
          </Col>

          <Col span={layout.sideCol}>
            <Card
              title={
                <Title level={4}>
                  <span className="text_payment">Xác nhận thanh toán</span>
                </Title>
              }
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                position: isMobile ? "relative" : "sticky",
                top: "20px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Title
                  level={2}
                  style={{ color: "#ff4d4f", marginBottom: "24px" }}
                >
                  {Number(finalPrice).toLocaleString()} VND
                </Title>

                <PaymentMethodSelector
                  onMethodSelect={handlePaymentMethodSelect}
                  selectedMethod={paymentMethod}
                />

                <button
                  className="btn_payment"
                  size="large"
                  onClick={handleConfirmPayment}
                  style={{
                    borderRadius: "8px",
                    marginTop: "20px",
                  }}
                >
                  Thanh toán
                </button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

PaymentMethodSelector.propTypes = {
  onMethodSelect: PropTypes.func.isRequired,
  selectedMethod: PropTypes.string,
};

export default PaymentPage;

import { useEffect, useState } from "react";
import { Modal, Typography, message, Spin, Result } from "antd";
import QRCode from "qrcode";
import PropTypes from "prop-types";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { confirmPayment } from "../../../../server/src/Api/paymentApi";

const PaymentQRModal = ({
  visible,
  onClose,
  userId,
  courseId,
  amount,
  paymentId,
}) => {
  const [qrCodeData, setQrCodeData] = useState("");
  const [paymentCode, setPaymentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const navigate = useNavigate();

  // Generate a payment code: first 2 chars are userId, last 2 are courseId,
  // middle 2 are random
  const generatePaymentCode = () => {
    const userIdPart = String(userId).padStart(2, "0").slice(-2);
    const courseIdPart = String(courseId).padStart(2, "0").slice(-2);
    const randomPart = Math.floor(Math.random() * 90 + 10);
    return `${userIdPart}${randomPart}${courseIdPart}`;
  };

  useEffect(() => {
    // Generate payment code and QR Code when modal is opened
    if (visible) {
      const generatedPaymentCode = generatePaymentCode();
      setPaymentCode(generatedPaymentCode);

      QRCode.toDataURL(`QR${generatedPaymentCode}#${amount}`)
        .then((url) => {
          setQrCodeData(url);
        })
        .catch(() => {
          message.error("Không thể tạo mã QR");
        });
    }
  }, [visible, amount, userId, courseId]);

  const handleCopyCode = async () => {
    try {
      setIsLoading(true);
      await navigator.clipboard.writeText(paymentCode);

      // Confirm payment with payment ID and generated payment code as transaction ID
      await confirmPayment(paymentId, paymentCode);

      setIsLoading(false);
      setIsPaymentSuccess(true);

      // Delay to show success state
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Close modal and navigate
      onClose();
      navigate(`/courses/${courseId}`);
    } catch (error) {
      setIsLoading(false);
      message.error(error.message || "Không thể sao chép mã");
    }
  };

  // If payment is successful, render success modal
  if (isPaymentSuccess) {
    return (
      <Modal open={visible} onCancel={onClose} footer={null} centered>
        <Result
          status="success"
          title="Thanh toán thành công!"
          subTitle={`Mã thanh toán: ${paymentCode}`}
          icon={
            <CheckCircleOutlined
              style={{ color: "#52c41a", fontSize: "72px" }}
            />
          }
        />
      </Modal>
    );
  }

  return (
    <Modal
      title="Quét mã QR để thanh toán"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Render QR Code */}
        {qrCodeData && (
          <img
            src={qrCodeData}
            alt="QR Code"
            style={{ width: "256px", height: "256px" }}
          />
        )}

        {/* Display payment code */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Typography.Text strong style={{ fontSize: "18px" }}>
            Mã thanh toán: {paymentCode}
          </Typography.Text>
          <Typography.Link onClick={handleCopyCode} disabled={isLoading}>
            {isLoading ? <Spin size="small" /> : "Sao chép"}
          </Typography.Link>
        </div>

        {/* Display payment amount */}
        <Typography.Text type="secondary">
          Vui lòng thanh toán đúng số tiền: {amount.toLocaleString()} VND
        </Typography.Text>
      </div>
    </Modal>
  );
};

PaymentQRModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  amount: PropTypes.number.isRequired,
  paymentId: PropTypes.string.isRequired,
};

export default PaymentQRModal;

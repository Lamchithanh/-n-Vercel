import { useState } from "react";
import { Card, Radio, Space, Row, Col, Typography } from "antd";
import {
  WalletOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { useMediaQuery } from "react-responsive";

const { Text } = Typography;

const PaymentMethodSelector = ({ onMethodSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });

  const handleMethodChange = (value) => {
    setSelectedMethod(value);
    if (value !== "bank") {
      setSelectedBank("");
      onMethodSelect(value);
    }
  };

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    onMethodSelect("bank"); // Notify parent component of selection
  };

  const getBankColSpan = () => {
    if (isMobile) return 8;
    if (isTablet) return 6;
    return 6;
  };

  const getCardTypeColSpan = () => {
    if (isMobile) return 12;
    return 8;
  };

  const banks = [
    { name: "Vietcombank", code: "vcb" },
    { name: "Techcombank", code: "tcb" },
    { name: "BIDV", code: "bidv" },
    { name: "Agribank", code: "agri" },
    { name: "VPBank", code: "vpb" },
    { name: "MBBank", code: "mb" },
    { name: "ACB", code: "acb" },
    { name: "TPBank", code: "tpb" },
  ];

  const cardTypes = [
    { name: "Visa", color: "#1a1f71" },
    { name: "Master", color: "#eb001b" },
    { name: "JCB", color: "#0f0" },
  ];

  const renderPaymentOption = (value, icon, title, description) => (
    <Card
      hoverable
      className={`payment-option ${selectedMethod === value ? "selected" : ""}`}
      style={{
        borderRadius: 8,
        cursor: "pointer",
        borderColor: selectedMethod === value ? "#1890ff" : undefined,
        backgroundColor: selectedMethod === value ? "#e6f7ff" : undefined,
        marginBottom: isMobile ? 8 : 16,
      }}
    >
      <Radio value={value}>
        <Space size="middle" align="start">
          {icon}
          <div>
            <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>
              {title}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
              {description}
            </Text>
          </div>
        </Space>
      </Radio>
    </Card>
  );

  return (
    <div style={{ width: "100%" }}>
      <Radio.Group
        onChange={(e) => handleMethodChange(e.target.value)}
        value={selectedMethod}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          {renderPaymentOption(
            "ewallet",
            <WalletOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
            "Ví điện tử",
            "MoMo, ZaloPay, VNPay"
          )}

          {renderPaymentOption(
            "qr",
            <QrcodeOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
            "Quét mã QR",
            "Quét mã QR từ ứng dụng ngân hàng"
          )}

          <Card
            hoverable
            className={`payment-option ${
              selectedMethod === "bank" ? "selected" : ""
            }`}
            style={{
              borderRadius: 8,
              cursor: "pointer",
              borderColor: selectedMethod === "bank" ? "#1890ff" : undefined,
              backgroundColor:
                selectedMethod === "bank" ? "#e6f7ff" : undefined,
            }}
          >
            <Radio value="bank">
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <Space size="middle" align="start">
                  <CreditCardOutlined
                    style={{ fontSize: 24, color: "#1890ff" }}
                  />
                  <div>
                    <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>
                      Thẻ ngân hàng
                    </Text>
                    <br />
                    <Text
                      type="secondary"
                      style={{ fontSize: isMobile ? 12 : 14 }}
                    >
                      Thanh toán bằng thẻ ATM/Visa/Master
                    </Text>
                  </div>
                </Space>

                {selectedMethod === "bank" && (
                  <div style={{ marginTop: isMobile ? 8 : 16 }}>
                    <Text
                      strong
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        marginBottom: 8,
                        display: "block",
                      }}
                    >
                      Chọn ngân hàng:
                    </Text>
                    <Row gutter={[8, 8]}>
                      {banks.map((bank) => (
                        <Col span={getBankColSpan()} key={bank.code}>
                          <Card
                            size="small"
                            hoverable
                            style={{
                              textAlign: "center",
                              cursor: "pointer",
                              borderColor:
                                selectedBank === bank.code
                                  ? "#1890ff"
                                  : undefined,
                              backgroundColor:
                                selectedBank === bank.code
                                  ? "#e6f7ff"
                                  : undefined,
                              padding: isMobile ? 4 : 8,
                            }}
                            onClick={() => handleBankSelect(bank.code)}
                          >
                            <Text style={{ fontSize: isMobile ? 11 : 12 }}>
                              {bank.name}
                            </Text>
                          </Card>
                        </Col>
                      ))}
                    </Row>

                    <div style={{ marginTop: 16 }}>
                      <Text
                        strong
                        style={{
                          fontSize: isMobile ? 13 : 14,
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        Loại thẻ hỗ trợ:
                      </Text>
                      <Row gutter={[8, 8]}>
                        {cardTypes.map((cardType) => (
                          <Col span={getCardTypeColSpan()} key={cardType.name}>
                            <Card
                              size="small"
                              style={{
                                textAlign: "center",
                                background: "#f0f5ff",
                                borderColor: "#d6e4ff",
                              }}
                            >
                              <Text
                                strong
                                style={{
                                  color: cardType.color,
                                  fontSize: isMobile ? 12 : 13,
                                }}
                              >
                                {cardType.name}
                              </Text>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </div>
                )}
              </Space>
            </Radio>
          </Card>
        </Space>
      </Radio.Group>
    </div>
  );
};

PaymentMethodSelector.propTypes = {
  onMethodSelect: PropTypes.func.isRequired,
};

export default PaymentMethodSelector;

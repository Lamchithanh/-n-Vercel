import { Progress } from "antd";
import PropTypes from "prop-types";

const SharedCourseProgress = ({ progress, showDetails = true }) => {
  // Đảm bảo progress là số
  const progressValue = typeof progress === "number" ? progress : 0;

  const getProgressColor = (percent) => {
    if (percent >= 100) return "#52c41a";
    if (percent >= 75) return "#1890ff";
    if (percent >= 50) return "#722ed1";
    return "#108ee9";
  };

  const getProgressStatus = (percent) => {
    if (percent >= 100) return "success";
    if (percent > 0) return "active";
    return "normal";
  };

  const getProgressMessage = (percent) => {
    if (percent === 100) return "Chúc mừng bạn đã hoàn thành khóa học! 🎉";
    if (percent >= 75) return "Đã hơn một nửa, sắp hoàn thành khóa học! 🎯";
    if (percent >= 50) return "Đã hoàn thành một nửa chặng đường! 🚀";
    if (percent > 0) return "Còn chặng đường dài! 💪";
    return "Bắt đầu học nào! 📝";
  };

  // Đảm bảo percent là số và nằm trong khoảng 0-100
  const safePercent = Math.min(Math.max(0, progressValue), 100);

  return (
    <div className="w-full">
      <Progress
        percent={safePercent}
        status={getProgressStatus(safePercent)}
        strokeColor={{
          "0%": getProgressColor(safePercent),
          "100%": getProgressColor(100),
        }}
        showInfo={showDetails}
      />
      {showDetails && (
        <div
          style={{
            color: getProgressColor(safePercent),
            textAlign: "center",
            marginTop: "10px",
          }}
          className="progress-stats"
        >
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
            {getProgressMessage(safePercent)}
          </div>
          <span>{safePercent.toFixed(1)}% hoàn thành</span>
        </div>
      )}
    </div>
  );
};

SharedCourseProgress.propTypes = {
  progress: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  showDetails: PropTypes.bool,
};

export default SharedCourseProgress;

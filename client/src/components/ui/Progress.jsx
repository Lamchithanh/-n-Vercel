import PropTypes from "prop-types";
import "./Progress.scss"; // Đảm bảo bạn tạo tệp SCSS này

const Progress = ({ percent }) => {
  return (
    <div className="custom-progress">
      <div className="progress-bar" style={{ width: `${percent}%` }}></div>
    </div>
  );
};

Progress.propTypes = {
  percent: PropTypes.number.isRequired, // percent phải là số và bắt buộc
};

export default Progress;

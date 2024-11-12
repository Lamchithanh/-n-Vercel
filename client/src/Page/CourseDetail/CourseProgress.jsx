import { useEffect, useState } from "react";
import { Card, message } from "antd";
import PropTypes from "prop-types";
import Progress from "../../components/ui/Progress";
import { getProgressAPI } from "../../../../server/src/Api/courseApi";

const CourseProgress = ({ modules, userId, courseId }) => {
  const [progress, setProgress] = useState(0);
  const [watchedLessons, setWatchedLessons] = useState([]);
  const [lastMilestoneReached, setLastMilestoneReached] = useState(0);

  // Tính tổng số bài học từ các module
  const totalLessons = modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  // Kiểm tra và hiển thị thông báo khi đạt các mốc tiến độ
  const checkProgressMilestones = (currentProgress) => {
    const milestones = [50, 75, 100];
    let highestMilestoneReached = lastMilestoneReached;

    milestones.forEach((milestone) => {
      if (currentProgress >= milestone && lastMilestoneReached < milestone) {
        highestMilestoneReached = milestone;
        let messageText = "";

        switch (milestone) {
          case 50:
            messageText = "Chúc mừng! Bạn đã hoàn thành 50% khóa học! 🌟";
            break;
          case 75:
            messageText = "Tuyệt vời! Bạn đã hoàn thành 75% khóa học! 🎯";
            break;
          case 100:
            messageText = "Chúc mừng! Bạn đã hoàn thành toàn bộ khóa học! 🎉";
            break;
          default:
            break;
        }

        message.success({
          content: messageText,
          duration: 5,
          className: "custom-milestone-message",
        });
      }
    });

    setLastMilestoneReached(highestMilestoneReached);
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await getProgressAPI(userId, courseId);
        // Chỉ lấy những bài học đã được xem hoàn toàn
        const watched = response.filter((p) => p.watched);
        const uniqueWatchedLessons = [
          ...new Set(watched.map((p) => p.lessonId)),
        ];
        setWatchedLessons(uniqueWatchedLessons);

        // Tính phần trăm tiến độ dựa trên số bài học unique đã xem
        const progressPercentage =
          (uniqueWatchedLessons.length / totalLessons) * 100;
        setProgress(progressPercentage);

        // Kiểm tra mốc tiến độ
        checkProgressMilestones(progressPercentage);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tiến độ:", error);
        message.error("Không thể cập nhật tiến độ học tập");
      }
    };

    if (userId && courseId) {
      fetchProgress();
    }
  }, [userId, courseId, totalLessons]);

  const getProgressColor = (percent) => {
    if (percent >= 100) return "#52c41a"; // Xanh lá khi hoàn thành
    if (percent >= 75) return "#1890ff"; // Xanh dương khi > 75%
    if (percent >= 50) return "#722ed1"; // Tím khi > 50%
    return "#108ee9"; // Màu mặc định
  };

  const getProgressStatus = (percent) => {
    if (percent >= 100) return "success";
    if (percent > 0) return "active";
    return "normal";
  };

  return (
    <Card className="course-progress-card">
      <div className="progress-header">
        <h3>Tiến độ học tập</h3>
      </div>
      <Progress
        percent={Number(progress.toFixed(1))}
        status={getProgressStatus(progress)}
        strokeColor={{
          "0%": getProgressColor(progress),
          "100%": getProgressColor(100),
        }}
      />
      <div
        style={{
          color: getProgressColor(progress),
          textAlign: "center",
          marginTop: "10px",
        }}
        className="progress-stats"
      >
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
          {progress === 100
            ? "Chúc mừng bạn đã hoàn thành khóa học! 🎉"
            : progress >= 75
            ? "Bạn sắp thoát kíp con gà  rồi! 🎯"
            : progress >= 50
            ? "Đã hoàn thành một nửa chặng đường! 💪"
            : progress > 0
            ? "Còn gà lắm! 🌟"
            : "Bắt đầu học nào! 📚"}
        </div>
        <span>{progress.toFixed(1)}% hoàn thành</span>
        <span style={{ margin: "0 10px" }}>•</span>
        <span>
          {watchedLessons.length}/{totalLessons} bài học
        </span>
      </div>
    </Card>
  );
};

CourseProgress.propTypes = {
  modules: PropTypes.arrayOf(
    PropTypes.shape({
      lessons: PropTypes.arrayOf(
        PropTypes.shape({
          lessonId: PropTypes.string.isRequired,
          watched: PropTypes.bool.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  userId: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default CourseProgress;

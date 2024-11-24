import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Progress from "../../components/ui/Progress";

const MyCourseProgress = ({ userId, courseId }) => {
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        // Đảm bảo URL API đúng với backend
        const response = await axios.get(
          `http://localhost:9000/api/mycourses/progress/${userId}/${courseId}`
        );

        console.log("Progress response:", response.data); // Debug log

        setProgress(parseFloat(response.data.progress));
        setCompletedLessons(response.data.completedLessons);
        setLessonCount(response.data.lessonCount);
        setError(null);
      } catch (err) {
        console.error("Error fetching progress:", err);
        setError("Không thể tải dữ liệu tiến độ học tập");
      } finally {
        setLoading(false);
      }
    };

    if (userId && courseId) {
      fetchProgress();
    }
  }, [userId, courseId]);

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

  if (loading) {
    return (
      <div className="w-full max-w-md p-2 bg-white rounded-lg">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md p-2 bg-white rounded-lg">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-2 bg-white rounded-lg">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div className="text-xs font-semibold text-gray-600 w-full">
            <div className="flex justify-between">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span></span>
                <span style={{ color: "#666" }}>
                  {completedLessons}/{lessonCount}
                </span>
              </div>
              <p></p>
              <Progress
                percent={Number(progress.toFixed(1))}
                status={getProgressStatus(progress)}
                strokeColor={{
                  "0%": getProgressColor(progress),
                  "100%": getProgressColor(100),
                }}
              />
              <p></p>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Tiến độ </span>
                <span style={{ color: "#666" }}>{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MyCourseProgress.propTypes = {
  userId: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default MyCourseProgress;

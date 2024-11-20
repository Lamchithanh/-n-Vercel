import { useEffect, useState } from "react";
import { Card, message, Spin, Button } from "antd";
import PropTypes from "prop-types";
import Progress from "../../components/ui/Progress";
import { getProgressAPI } from "../../../../server/src/Api/courseApi";
import {
  getCertificateStatusAPI,
  requestCertificateAPI,
} from "../../../../server/src/Api/CertificateRequestAPI";

const CourseProgress = ({ modules, userId, courseId }) => {
  const [progress, setProgress] = useState(0);
  const [watchedLessons, setWatchedLessons] = useState([]);
  const [lastMilestoneReached, setLastMilestoneReached] = useState(0);
  const [canRequestCertificate, setCanRequestCertificate] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isRequestingCertificate, setIsRequestingCertificate] = useState(false);
  const [displayedMilestones, setDisplayedMilestones] = useState(() => {
    const saved = localStorage.getItem(
      `displayedMilestones-${courseId}-${userId}`
    );
    return saved ? JSON.parse(saved) : {};
  });

  const totalLessons = modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  const checkProgressMilestones = (currentProgress) => {
    const milestones = [50, 75, 100];
    let highestMilestoneReached = lastMilestoneReached;

    milestones.forEach((milestone) => {
      const milestoneKey = `${milestone}-${courseId}-${userId}`;
      if (
        currentProgress >= milestone &&
        lastMilestoneReached < milestone &&
        !displayedMilestones[milestoneKey]
      ) {
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

        if (messageText) {
          message.success({
            content: messageText,
            duration: 5,
            className: "custom-milestone-message",
          });

          const newDisplayedMilestones = {
            ...displayedMilestones,
            [milestoneKey]: true,
          };
          setDisplayedMilestones(newDisplayedMilestones);
          localStorage.setItem(
            `displayedMilestones-${courseId}-${userId}`,
            JSON.stringify(newDisplayedMilestones)
          );
        }
      }
    });

    setLastMilestoneReached(highestMilestoneReached);
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await getProgressAPI(userId, courseId);

        const watched = response.filter(
          (p) => p.watched === true || p.progress >= 90
        );

        const watchedLessonIds = watched.map((p) => p.lessonId);

        localStorage.setItem(
          `watchedLessons-${courseId}-${userId}`,
          JSON.stringify(watchedLessonIds)
        );

        const progressPercentage =
          (watchedLessonIds.length / totalLessons) * 100;

        setWatchedLessons(watchedLessonIds);
        setProgress(progressPercentage);

        if (progressPercentage >= 100) {
          setCanRequestCertificate(true);
        } else {
          setCanRequestCertificate(false);
        }

        checkProgressMilestones(progressPercentage);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tiến độ:", error);
        if (error.response && error.response.status !== 404) {
          message.error(
            "Không thể cập nhật tiến độ học tập. Vui lòng thử lại sau."
          );
        }

        localStorage.removeItem(`watchedLessons-${courseId}-${userId}`);
        setWatchedLessons([]);
        setProgress(0);
        setCanRequestCertificate(false);
      }
    };

    const fetchCertificateStatus = async () => {
      try {
        const response = await getCertificateStatusAPI(userId, courseId);
        if (response.data && response.data.status) {
          setCertificateStatus(response.data.status);
        }
      } catch (error) {
        console.error("Error fetching certificate status:", error);
        // Chỉ hiển thị thông báo khi người dùng đang yêu cầu cấp chứng chỉ
        if (isRequestingCertificate) {
          message.error(
            "Không thể kiểm tra trạng thái chứng chỉ. Vui lòng thử lại sau."
          );
        }
        setCertificateStatus(null);
      } finally {
        setLoadingStatus(false);
        setIsRequestingCertificate(false);
      }
    };

    if (userId && courseId) {
      fetchProgress();
      fetchCertificateStatus();
    }

    return () => {
      localStorage.removeItem(`watchedLessons-${courseId}-${userId}`);
    };
  }, [userId, courseId, totalLessons]);

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

  const handleRequestCertificate = async () => {
    setIsRequestingCertificate(true);
    try {
      const response = await requestCertificateAPI(userId, courseId);
      if (response.data.accepted === false) {
        message.error(
          "Yêu cầu cấp chứng chỉ không thành công. Vui lòng kiểm tra lại điều kiện yêu cầu chứng chỉ."
        );
      } else {
        message.success("Yêu cầu cấp chứng chỉ thành công! 🎓");
        setCanRequestCertificate(false);
        // Cập nhật lại trạng thái chứng chỉ sau khi yêu cầu thành công
        const statusResponse = await getCertificateStatusAPI(userId, courseId);
        if (statusResponse.data && statusResponse.data.status) {
          setCertificateStatus(statusResponse.data.status);
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu cấp chứng chỉ:", error);
      message.error(
        "Không thể gửi yêu cầu cấp chứng chỉ. Vui lòng thử lại sau."
      );
    } finally {
      setIsRequestingCertificate(false);
    }
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
            ? "Đã hơn một nửa, sắp hoàn thành khóa học! 🎯"
            : progress >= 50
            ? "Đã hoàn thành một nửa chặng đường! 🚀"
            : progress > 0
            ? "Còn chặng đường dài! 💪"
            : "Bắt đầu học nào! 📝"}
        </div>
        <span>{progress.toFixed(1)}% hoàn thành</span>
        <span style={{ margin: "0 10px" }}>•</span>
        <span>
          {watchedLessons.length}/{totalLessons} bài học
        </span>
        <p>
          {canRequestCertificate && certificateStatus === null && (
            <Button
              type="primary"
              onClick={handleRequestCertificate}
              className="mt-4"
              loading={isRequestingCertificate}
            >
              Yêu cầu cấp chứng chỉ
            </Button>
          )}
        </p>

        {certificateStatus !== null && (
          <div className="certificate-status">
            {certificateStatus === "Đã cấp chứng chỉ" ? (
              <span style={{ color: "green" }}>
                Bạn đã nhận được chứng chỉ!🏆
              </span>
            ) : certificateStatus ===
              "Yêu cầu chứng chỉ đã được chấp nhận, nhưng chứng chỉ chưa được cấp" ? (
              <span style={{ color: "orange" }}>
                Yêu cầu chứng chỉ đã được chấp nhận, chứng chỉ sẽ được cấp sớm.
              </span>
            ) : (
              <span>Yêu cầu chứng chỉ đang được xử lý...</span>
            )}
          </div>
        )}
        {loadingStatus && <Spin />}
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

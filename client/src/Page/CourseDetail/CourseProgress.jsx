import { useCallback, useEffect, useState } from "react";
import { Card, message, Button } from "antd";
import PropTypes from "prop-types";
import Progress from "../../components/ui/Progress";
import { getProgressAPI } from "../../../../server/src/Api/courseApi";
import {
  getCertificateStatusAPI,
  requestCertificateAPI,
} from "../../../../server/src/Api/CertificateRequestAPI";
import { API_URL } from "../../../../server/src/config/config";

const CourseProgress = ({ modules, userId, courseId }) => {
  const [progress, setProgress] = useState(0);
  const [watchedLessons, setWatchedLessons] = useState([]);
  const [lastMilestoneReached, setLastMilestoneReached] = useState(0);
  const [canRequestCertificate, setCanRequestCertificate] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState(null);
  const [isRequestingCertificate, setIsRequestingCertificate] = useState(false);
  const [availableCoupon, setAvailableCoupon] = useState(null);
  const [isCouponClaimed, setIsCouponClaimed] = useState(false);
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

  const fetchCoupon = async () => {
    try {
      const response = await fetch(`${API_URL}/mycoupons`);
      if (!response.ok) {
        throw new Error("Không thể lấy thông tin mã giảm giá");
      }
      const data = await response.json();

      setAvailableCoupon(
        data
          ? {
              ...data,
              discount_amount: data.discount_amount || 0,
            }
          : null
      );
    } catch (error) {
      console.error("Error fetching coupon:", error);
      message.error("Không thể lấy thông tin mã giảm giá");
    }
  };

  const handleClaimCoupon = async () => {
    try {
      if (!userId || !courseId || !availableCoupon) {
        message.error("Thông tin không đầy đủ để nhận mã giảm giá");
        return;
      }

      const response = await fetch(`${API_URL}/mycoupons/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          coupon_id: availableCoupon.id,
          course_id: courseId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success("Nhận mã giảm giá thành công!");
        setIsCouponClaimed(true);
      } else {
        message.error(data.message || "Lỗi khi nhận mã giảm giá");
      }
    } catch (error) {
      console.error("Error claiming coupon:", error);
      message.error("Không thể nhận mã giảm giá");
    }
  };

  const checkProgressMilestones = useCallback(
    (currentProgress) => {
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
              fetchCoupon();
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
    },
    [lastMilestoneReached, displayedMilestones, courseId, userId]
  );

  const checkCouponClaimed = async () => {
    try {
      const response = await fetch(`${API_URL}/mycoupons/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
        }),
      });

      const data = await response.json();
      if (data.success && data.is_claimed) {
        setIsCouponClaimed(true); // Đánh dấu mã đã nhận
      } else {
        setIsCouponClaimed(false); // Mã chưa nhận
      }
    } catch (error) {
      console.error("Error checking coupon claimed status:", error);
      message.error("Không thể kiểm tra trạng thái mã giảm giá.");
    }
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
          fetchCoupon();
        } else {
          setCanRequestCertificate(false);
        }

        checkProgressMilestones(progressPercentage);
        checkCouponClaimed(); // Thêm kiểm tra mã giảm giá
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

    if (userId && courseId) {
      fetchProgress();
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
      // Kiểm tra nếu người dùng đã hoàn thành khóa học (Tiến độ 100%)
      if (progress >= 100) {
        const response = await requestCertificateAPI(userId, courseId);
        if (response.data.accepted === false) {
          message.error(
            "Yêu cầu cấp chứng chỉ không thành công. Vui lòng kiểm tra lại điều kiện yêu cầu chứng chỉ."
          );
        } else {
          message.success("Yêu cầu cấp chứng chỉ thành công! 🎓");
          setCanRequestCertificate(false);
          // Cập nhật trạng thái chứng chỉ sau khi yêu cầu thành công
          const statusResponse = await getCertificateStatusAPI(
            userId,
            courseId
          );
          if (statusResponse.data && statusResponse.data.status) {
            setCertificateStatus(statusResponse.data.status);
          }
        }
      } else {
        message.error(
          "Vui lòng hoàn thành khóa học trước khi yêu cầu chứng chỉ."
        );
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
          {canRequestCertificate &&
            certificateStatus === null &&
            progress === 100 && (
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
        {!isCouponClaimed && availableCoupon ? (
          <Button type="primary" onClick={handleClaimCoupon}>
            Nhận mã giảm giá: {availableCoupon.code}
          </Button>
        ) : isCouponClaimed && availableCoupon ? (
          <div>
            <span style={{ color: "green" }}>
              Bạn đã nhận mã giảm giá: {availableCoupon.code}
            </span>
            <p>Giảm {availableCoupon.discount_amount || 0}%</p>
          </div>
        ) : null}

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

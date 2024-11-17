import { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { message } from "antd";
import {
  updateProgressAPI,
  getProgressAPI,
} from "../../../../server/src/Api/courseApi";
import "./VideoProgressTracker.scss";
import PropTypes from "prop-types";

const VideoProgressTracker = ({
  lessonId,
  videoUrl,
  modules,
  onProgressUpdate,
}) => {
  const [player, setPlayer] = useState(null);
  const [setWatchedPercentage] = useState(0);
  const progressUpdateRef = useRef(false);
  const progressInterval = useRef(null);

  const getYoutubeId = (url) => {
    const match = url.match(
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    );
    return match && match[2].length === 11 ? match[2] : null;
  };

  const opts = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
    },
  };

  const onReady = (event) => {
    setPlayer(event.target);
  };

  const updateWatchProgress = async (currentTime, videoDuration) => {
    const percentage = (currentTime / videoDuration) * 100;
    setWatchedPercentage(percentage);

    if (percentage > 95 && !progressUpdateRef.current) {
      progressUpdateRef.current = true;

      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        try {
          await updateProgressAPI({
            userId: user.id,
            lessonId: lessonId,
            watched: true,
            watchedDuration: currentTime,
          });
          onProgressUpdate(lessonId);
          message.success("Bài học đã được hoàn thành!");
        } catch (error) {
          console.error("Error updating progress:", error);
          progressUpdateRef.current = false;
        }
      }
    }
  };

  const onStateChange = (event) => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    if (event.data === YouTube.PlayerState.PLAYING) {
      progressInterval.current = setInterval(() => {
        if (player && !progressUpdateRef.current) {
          const currentTime = player.getCurrentTime();
          updateWatchProgress(currentTime, player.getDuration());
        }
      }, 1000);
    }
  };

  useEffect(() => {
    const checkPreviousLessons = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          message.error("Bạn cần đăng nhập để xem bài học này.");
          return;
        }

        if (!modules || !Array.isArray(modules)) {
          return; // Tránh hiển thị lỗi nếu modules chưa load xong
        }

        const currentModule = modules.find((m) => m.id === lessonId);
        if (!currentModule) {
          return; // Tránh hiển thị lỗi nếu không tìm thấy module hiện tại
        }

        const progressData = await getProgressAPI(
          user.id,
          currentModule.course_id
        );

        const completedLessons = progressData.filter((p) => p.watched);
        const currentLessonIndex = modules.findIndex((m) => m.id === lessonId);

        if (
          currentLessonIndex > 0 &&
          completedLessons.length < currentLessonIndex
        ) {
          message.error(
            "Bạn cần hoàn thành các bài học trước đó trước khi xem bài này."
          );
          return;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra tiến độ:", error);
      }
    };

    checkPreviousLessons();

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [lessonId, modules]);

  return (
    <div className="video-container">
      <YouTube
        videoId={getYoutubeId(videoUrl)}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        className="video-player"
        containerClassName="video-player-container"
      />
    </div>
  );
};

VideoProgressTracker.propTypes = {
  lessonId: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
  duration: PropTypes.number,
  modules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      course_id: PropTypes.string.isRequired,
    })
  ).isRequired,
  onProgressUpdate: PropTypes.func.isRequired,
};

export default VideoProgressTracker;

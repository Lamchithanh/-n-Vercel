import React, { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { message } from "antd";
import { updateProgressAPI } from "../../../../server/src/Api/courseApi";
import "./VideoProgressTracker.scss"; // Đảm bảo tạo file CSS này

const VideoProgressTracker = ({
  lessonId,
  videoUrl,
  duration,
  onProgressUpdate,
}) => {
  const [player, setPlayer] = useState(null);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
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
    height: "600px",
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
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, []);

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

export default VideoProgressTracker;

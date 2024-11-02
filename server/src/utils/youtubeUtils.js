// src/utils/youtubeUtils.js

const { google } = require("googleapis");

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// Hàm lấy video ID từ URL YouTube
const getVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu.be\/|youtube.com\/embed\/)([^&\n?#]+)/,
    /^([^&\n?#]+)$/, // Nếu chỉ có video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Hàm lấy thời lượng video từ YouTube API
const getVideoDuration = async (videoUrl) => {
  try {
    const videoId = getVideoId(videoUrl);
    if (!videoId) return null;

    const response = await youtube.videos.list({
      part: ["contentDetails"],
      id: [videoId],
    });

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    // Chuyển đổi duration từ ISO 8601 sang định dạng MM:SS hoặc HH:MM:SS
    const duration = response.data.items[0].contentDetails.duration;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  } catch (error) {
    console.error("Error fetching video duration:", error);
    return null;
  }
};

// Xuất khẩu cả hai hàm
module.exports = {
  getVideoId, // Thêm getVideoId vào xuất khẩu
  getVideoDuration,
};

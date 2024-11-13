// utils/youtubeUtils.js

const getVideoId = (url) => {
  if (!url) return null;

  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

const getVideoDuration = async (url, youtube) => {
  try {
    const videoId = getVideoId(url);
    if (!videoId) return null;

    const response = await youtube.videos.list({
      part: "contentDetails",
      id: videoId,
    });

    if (!response.data.items || !response.data.items[0]) {
      return null;
    }

    const duration = response.data.items[0].contentDetails.duration;
    return convertDurationToMinutes(duration);
  } catch (error) {
    console.error("Error getting video duration:", error);
    return null;
  }
};

const convertDurationToMinutes = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  // Giữ nguyên phần lẻ của phút thay vì làm tròn
  return hours * 60 + minutes + seconds / 60;
};

module.exports = {
  getVideoId,
  getVideoDuration,
  convertDurationToMinutes,
};

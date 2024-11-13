const convertTimeToMinutes = (timeString) => {
  // Handle YouTube API format (PT1H2M10S)
  if (timeString.startsWith("PT")) {
    const match = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    return Math.round(hours * 60 + minutes + seconds / 60);
  }

  // Handle HH:MM:SS or MM:SS format
  const parts = timeString.split(":").map((part) => parseInt(part));
  if (parts.length === 3) {
    // HH:MM:SS format
    return Math.round(parts[0] * 60 + parts[1] + parts[2] / 60);
  } else if (parts.length === 2) {
    // MM:SS format
    return Math.round(parts[0] + parts[1] / 60);
  }

  // If it's already a number, return it
  const numericValue = parseFloat(timeString);
  if (!isNaN(numericValue)) {
    return numericValue;
  }

  return 0; // Default fallback
};

module.exports = { convertTimeToMinutes };

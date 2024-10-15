import React from "react";

const VideoPlayer = ({ video }) => {
    return (
        <div>
            <video src={video.src} controls />
        </div>
    );
};

export default VideoPlayer;

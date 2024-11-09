import { Button } from "antd";

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-400 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            Khám Phá Hành Trình Học Tập Của Bạn
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Hàng nghìn khóa học chất lượng cao từ các chuyên gia hàng đầu
          </p>
          <div className="flex justify-center gap-4">
            <Button
              type="primary"
              size="large"
              className="bg-white text-blue-600"
            >
              Bắt đầu học ngay
            </Button>
            <Button size="large" ghost>
              Xem khóa học
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

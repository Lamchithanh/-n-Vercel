// BannerScrollView.jsx
import { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import AOS from "aos";
import "aos/dist/aos.css";

const BannerScrollView = () => {
  //   const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      // Giả lập API call
      //   const response = await mockFetchBanners();
      //   setBanners(response);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-1/2 max-w-2xl">
        <Card className="shadow-lg">
          {loading ? (
            <div className="flex justify-center p-8">
              <Spin size="large" />
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="mb-4 last:mb-0"
                >
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={banner.title}
                        src={banner.imageUrl}
                        className="object-cover h-48 w-full"
                      />
                    }
                  >
                    <Card.Meta
                      title={banner.title}
                      description={banner.description}
                    />
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BannerScrollView;

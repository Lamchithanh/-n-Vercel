import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../../../../server/src/config/config";
import { Input, Card, List, Typography, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import Loader from "../../context/Loader";

const { Title, Text } = Typography;

const CourseSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef(null);

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setResults([]);
        setSearched(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/search`, {
          params: { query },
        });

        if (response.data.success) {
          setResults(response.data.data);
        } else {
          console.error("Search failed:", response.data.message);
          setResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCardClick = (courseId) => {
    if (courseId) {
      setResults([]);
      setSearchQuery("");
      setSearched(false);
      navigate(`/courses/${courseId}?fromPaymentPage=true`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
        setSearchQuery("");
        setSearched(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="container mx-auto p-4" ref={searchRef}>
      <div className="mb-6" style={{ padding: 0 }}>
        <Input
          value={searchQuery}
          onChange={handleSearchInputChange}
          placeholder="Tìm kiếm khóa học..."
          className="w-full"
          allowClear
          style={{ padding: 5 }}
        />
      </div>

      {loading && (
        <div className="flex justify-center">
          <Loader />
        </div>
      )}

      {!loading && searched && results.length === 0 && searchQuery.trim() && (
        <div
          style={{
            position: "absolute",
            zIndex: 1000,
            marginTop: 20,
            background: "#8C42F6",

            padding: 20,
            borderRadius: 8,
            left: 0,
            width: "100%",
          }}
        >
          <Empty
            description={
              <Text strong>
                Không tìm thấy khóa học nào phù hợp với từ khóa "{searchQuery}"
              </Text>
            }
          />
        </div>
      )}

      {results.length > 0 && (
        <List
          style={{
            position: "absolute",
            zIndex: 100,
            marginTop: 20,
            background: "#e2ebeb",
            padding: 20,
            borderRadius: 8,
            left: 0,
            width: "100%",
          }}
          grid={{
            gutter: 16,
            xs: 1, // 1 cột trên các màn hình nhỏ
            sm: 2, // 2 cột trên các màn hình vừa
            md: 2, // 2 cột trên các màn hình lớn
            lg: 3, // 3 cột trên màn hình lớn
            xl: 3, // 3 cột trên màn hình rất lớn
            xxl: 3, // 3 cột trên màn hình siêu lớn
          }}
          dataSource={results}
          pagination={{
            pageSize: 6,
          }}
          renderItem={(course) => (
            <List.Item
              style={{
                display: "flex",
                justifyContent: "center", // Căn giữa khi chỉ có 1 hoặc 2 card
                marginBottom: "1rem", // Giãn cách giữa các dòng
              }}
              key={course.id}
            >
              <Card
                style={{
                  width: "100%", // Sử dụng full width của item
                  maxWidth: "350px", // Đảm bảo card không quá rộng khi chỉ có ít card
                }}
                hoverable
                onClick={() => handleCardClick(course.id)}
              >
                <Title level={4} className="mb-2 line-clamp-2">
                  {course.title}
                </Title>
                <Text
                  style={{ color: "gray" }}
                  className="text-gray-600 block mb-4 line-clamp-3"
                >
                  {course.description}
                </Text>
                <div className="flex justify-between items-center mt-auto">
                  <Text style={{ color: "orange" }} strong>
                    {course.price === "0" || course.price === "0.00"
                      ? "Miễn phí"
                      : `${course.price} vnd`}
                  </Text>
                  <div className="flex items-center gap-4">
                    <Text className="flex items-center gap-1">
                      <span>⭐</span>
                      {Number(course.average_rating || 0).toFixed(1)}
                    </Text>
                    <span> - </span>
                    <Text>{course.total_students || 0} học viên</Text>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default CourseSearch;

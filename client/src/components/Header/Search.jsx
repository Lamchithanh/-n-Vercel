import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../../../../server/src/config/config";
import { Input, Card, List, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";

const { Title, Text } = Typography;

const CourseSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category] = useState("all");
  const [level] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debounced search function to limit API calls
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/search`, {
          params: {
            query,
            category,
            level,
          },
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
      }
    }, 300),
    [category, level]
  );

  // Call search every time searchQuery changes
  useEffect(() => {
    debouncedSearch(searchQuery);

    // Cleanup function
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
      navigate(`/courses/${courseId}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6" style={{ padding: 0 }}>
        <Input
          value={searchQuery}
          onChange={handleSearchInputChange}
          placeholder="Tìm kiếm khóa học..."
          className="w-full mb-4"
          allowClear
        />
      </div>

      {loading && (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      )}

      {/* Only display the list if there are results */}
      {results.length > 0 && (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 3,
            xxl: 4,
          }}
          dataSource={results}
          pagination={{
            onChange: (page) => {
              console.log(page);
            },
            pageSize: 12,
          }}
          renderItem={(course) => (
            <List.Item key={course.id}>
              <Card
                hoverable
                className="h-full cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => handleCardClick(course.id)}
                cover={
                  course.image && (
                    <img
                      alt={course.title}
                      src={course.image}
                      className="h-48 object-cover w-full"
                    />
                  )
                }
              >
                <Title level={4} className="mb-2 line-clamp-2">
                  {course.title}
                </Title>
                <Text className="text-gray-600 block mb-4 line-clamp-3">
                  {course.description}
                </Text>
                <div className="flex justify-between items-center mt-auto">
                  <Text strong className="text-blue-600">
                    {course.price?.toLocaleString("vi-VN")} đ
                  </Text>
                  <div className="flex items-center gap-4">
                    <Text className="flex items-center gap-1">
                      <span>⭐</span>
                      {Number(course.average_rating || 0).toFixed(1)}
                    </Text>
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

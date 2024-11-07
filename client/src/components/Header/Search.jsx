import { useState, useEffect, useRef, useCallback } from "react";
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
  const searchRef = useRef(null); // Reference for search container

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
      navigate(`/courses/${courseId}`);
    }
  };

  // Clear search results when clicking outside the search container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
        setSearchQuery("");
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
        />
      </div>

      {loading && (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      )}

      {results.length > 0 && (
        <List
          style={{
            position: "absolute",
            zIndex: 100,
            marginTop: 20,
            background: "#ffd3d3",
            padding: 20,
            borderRadius: 8,
            left: 0,
          }}
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
            pageSize: 6,
          }}
          renderItem={(course) => (
            <List.Item
              style={{ display: "flex", justifyContent: "center" }}
              key={course.id}
            >
              <Card
                style={{ width: "80%" }}
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

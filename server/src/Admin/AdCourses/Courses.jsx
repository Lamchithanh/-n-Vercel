import React, { useState, useCallback, useEffect } from "react";
import {
  Table,
  Button,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  message,
  Radio,
  Upload,
  Progress,
  Image,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { uploadCourseImage } from "../../Api/courseApi";
import { API_URL } from "../../config/config";
import defaultimage from "../../../.././client/src/assets/img/sach.png";
const { Option } = Select;

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [priceRequired, setPriceRequired] = useState(true);
  const [uploadMethod, setUploadMethod] = useState("url");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [form] = Form.useForm();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Không thể tải khóa học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAddOrUpdateCourse = useCallback(
    async (values) => {
      try {
        if (isUploading) {
          message.warning("Vui lòng đợi quá trình upload ảnh hoàn tất");
          return;
        }

        setLoading(true);
        let imageUrl = values.imageUrl;

        if (uploadMethod === "file" && uploadedFile) {
          try {
            setIsUploading(true);
            // Truyền courseId nếu đang chỉnh sửa khóa học
            const courseId = editingCourse ? editingCourse.id : null;
            imageUrl = await uploadCourseImage(uploadedFile, courseId);
          } catch (uploadError) {
            message.error("Lỗi khi tải ảnh lên: " + uploadError.message);
            setIsUploading(false);
            setLoading(false);
            return;
          }
        }

        const courseData = {
          ...values,
          price: values.priceOption === "free" ? "0" : values.price.toString(),
          image: imageUrl || (editingCourse ? editingCourse.image : ""),
          intro_video_url: values.videoUrl,
        };

        const token = localStorage.getItem("token");
        const apiUrl = editingCourse
          ? `${API_URL}/courses/${editingCourse.id}`
          : `${API_URL}/courses`;
        const method = editingCourse ? "put" : "post";

        await axios[method](apiUrl, courseData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        message.success(
          `Khóa học ${
            editingCourse ? "đã được cập nhật" : "đã được thêm"
          } thành công`
        );

        setModalVisible(false);
        form.resetFields();
        setUploadedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
        await fetchCourses();
      } catch (error) {
        console.error("Error adding/updating course:", error);
        message.error(
          error.response?.data?.message ||
            "Không thể thêm/cập nhật khóa học. Vui lòng thử lại."
        );
      } finally {
        setLoading(false);
        setIsUploading(false);
      }
    },
    [fetchCourses, uploadMethod, uploadedFile, editingCourse, isUploading]
  );

  const confirmDelete = useCallback((courseId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa khóa học này?",
      onOk: () => handleDeleteCourse(courseId),
    });
  }, []);

  const editCourse = (record) => {
    setEditingCourse(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      price: record.price,
      level: record.level,
      category: record.category,
      videoUrl: record.intro_video_url,
      imageUrl: record.image, // Hiển thị URL ảnh hiện tại nếu có
    });
    setModalVisible(true);
  };

  const handleDeleteCourse = useCallback(
    async (courseId) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Khóa học đã được xóa thành công");
        await fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        message.error("Không thể xóa khóa học. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    [fetchCourses]
  );

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (imagePath) =>
        imagePath ? (
          <Image
            src={imagePath}
            width={100}
            height={100}
            style={{
              objectFit: "cover",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
            fallback={defaultimage} // Ảnh thay thế khi lỗi tải ảnh
          />
        ) : (
          <Image
            src={defaultimage} // Sử dụng ảnh mặc định khi không có ảnh
            width={100}
            height={100}
            style={{
              objectFit: "cover",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        ),
    },
    {
      title: "Tiêu Đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span>{text.length > 50 ? `${text.substring(0, 50)}...` : text}</span>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (text) => {
        if (text === "0") {
          return "Miễn Phí";
        }
        const formattedPrice = new Intl.NumberFormat("vi-VN").format(text);
        return `${formattedPrice} VND`;
      },
    },
    {
      title: "Cấp Độ",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (record) => (
        <span>
          <Button onClick={() => editCourse(record)} style={{ marginRight: 5 }}>
            Chỉnh Sửa
          </Button>
          <Button onClick={() => confirmDelete(record.id)} danger>
            Xóa
          </Button>
        </span>
      ),
    },
  ];

  const renderImageUploadField = () => {
    if (uploadMethod === "url") {
      return (
        <Form.Item
          name="imageUrl"
          label="URL Ảnh"
          extra={editingCourse ? "Để trống nếu muốn giữ ảnh hiện tại" : ""}
        >
          <Input placeholder="Nhập URL ảnh mới" />
        </Form.Item>
      );
    }

    return (
      <Form.Item
        name="imageFile"
        label="Tải Ảnh Lên"
        extra="Hỗ trợ: JPG, PNG, GIF (Max: 2MB)"
      >
        <Upload
          beforeUpload={(file) => {
            const isImage = file.type.startsWith("image/");
            if (!isImage) {
              message.error("Chỉ có thể tải lên file ảnh!");
              return false;
            }

            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
              message.error("File ảnh không được vượt quá 2MB!");
              return false;
            }

            setUploadedFile(file);
            return false;
          }}
          onRemove={() => {
            setUploadedFile(null);
            setUploadProgress(0);
          }}
          fileList={uploadedFile ? [uploadedFile] : []}
        >
          <Button icon={<UploadOutlined />} disabled={isUploading}>
            {isUploading ? "Đang tải lên..." : "Chọn Ảnh"}
          </Button>
        </Upload>
        {uploadProgress > 0 && <Progress percent={uploadProgress} />}
      </Form.Item>
    );
  };
  const [price, setPrice] = useState("");
  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setPrice(formattedValue);
  };
  const validatePrice = (_, value) => {
    const rawValue = value ? value.replace(/\./g, "") : ""; // Loại bỏ dấu chấm để kiểm tra
    if (!rawValue || rawValue.length < 4) {
      return Promise.reject(new Error("Giá phải có ít nhất 4 chữ số!"));
    }
    return Promise.resolve();
  };

  return (
    <Spin spinning={loading}>
      <Button
        onClick={() => {
          setEditingCourse(null);
          form.resetFields();
          setPriceRequired(true);
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm Khóa Học Mới
      </Button>

      <Table columns={columns} dataSource={courses} rowKey="id" />

      <Modal
        title={editingCourse ? "Chỉnh Sửa Khóa Học" : "Thêm Khóa Học Mới"}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setUploadedFile(null);
          setUploadProgress(0);
          setIsUploading(false);
        }}
        confirmLoading={loading || isUploading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrUpdateCourse}
          initialValues={{
            priceOption: "paid",
            uploadMethod: "url",
          }}
        >
          <Form.Item
            name="title"
            label="Tiêu Đề"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề khóa học!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả khóa học!" },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="priceOption"
            label="Tùy Chọn Giá"
            rules={[
              { required: true, message: "Vui lòng chọn một tùy chọn giá!" },
            ]}
          >
            <Select
              onChange={(value) => {
                setPriceRequired(value !== "free");
                if (value === "free") {
                  form.setFieldsValue({ price: "0" });
                }
              }}
            >
              <Option value="free">Miễn Phí</Option>
              <Option value="paid">Có Phí</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập giá khóa học!",
              },
              {
                validator: validatePrice,
              },
            ]}
          >
            <Input
              type="text"
              value={price}
              onChange={handlePriceChange}
              placeholder="Nhập giá khóa học"
            />
          </Form.Item>
          <Form.Item
            name="level"
            label="Cấp Độ"
            rules={[
              { required: true, message: "Vui lòng nhập cấp độ khóa học!" },
            ]}
          >
            <Select>
              <Option value="beginner">Người Mới Bắt Đầu</Option>
              <Option value="intermediate">Trung Cấp</Option>
              <Option value="advanced">Nâng Cao</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="Danh Mục"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn hoặc nhập danh mục khóa học!",
              },
            ]}
          >
            <Select
              mode="tags"
              placeholder="Chọn hoặc nhập danh mục mới"
              allowClear
            >
              <Option value="frontend">Frontend</Option>
              <Option value="backend">Backend</Option>
              <Option value="fullstack">Fullstack</Option>
              <Option value="devops">DevOps</Option>
              <Option value="mobile">Mobile Development</Option>
              <Option value="database">Database</Option>
              <Option value="cloud">Cloud Computing</Option>
            </Select>
          </Form.Item>
          <Form.Item name="videoUrl" label="URL Giới Thiệu Video">
            <Input />
          </Form.Item>
          <Form.Item name="uploadMethod" label="Phương Thức Tải Ảnh">
            <Radio.Group onChange={(e) => setUploadMethod(e.target.value)}>
              <Radio value="url">URL</Radio>
              <Radio value="file">File</Radio>
            </Radio.Group>
          </Form.Item>
          {renderImageUploadField()}
        </Form>
      </Modal>
    </Spin>
  );
};

export default Courses;

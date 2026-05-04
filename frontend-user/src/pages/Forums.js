import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Tag, Pagination, Empty, Spin, Modal, Form, Input, Select, message } from 'antd';
import { EyeOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Meta } = Card;
const { TextArea } = Input;

const Forums = () => {
  const navigate = useNavigate();
  const [forums, setForums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [creating, setCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchForums();
    fetchCategories();
  }, [page, selectedCategory]);

  const fetchForums = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
      };
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }

      const res = await api.get('/api/public/forums', { params });
      if (res.code === 200) {
        setForums(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/public/categories', {
        params: { type: 'forum' }
      });
      if (res.code === 200) {
        setCategories(res.data.list || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCreate = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = async (values) => {
    setCreating(true);
    try {
      const res = await api.post('/api/forum', values);
      if (res.code === 200) {
        message.success('发布成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchForums();
      } else {
        message.error(res.msg || '发布失败');
      }
    } catch (error) {
      message.error('发布失败，请稍后重试');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>论坛交流</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          发布帖子
        </Button>
      </div>

      {categories.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <Select
            placeholder="选择分类"
            style={{ width: 200 }}
            allowClear
            value={selectedCategory || undefined}
            onChange={(value) => {
              setSelectedCategory(value);
              setPage(1);
            }}
            options={categories.map(c => ({ label: c.name, value: c.id }))}
          />
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {forums.length > 0 ? forums.map(item => (
            <Col span={24} key={item.id}>
              <Card
                className="card-item forum-card"
                hoverable
                onClick={() => navigate(`/forums/${item.id}`)}
              >
                <Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: '500' }}>{item.title}</span>
                      <div>
                        {item.created_at && (
                          <span style={{ color: '#999', fontSize: '12px', marginRight: '16px' }}>
                            {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ 
                        color: '#666',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '40px'
                      }}>
                        {item.content}
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <Tag icon={<EyeOutlined />}>浏览: {item.views}</Tag>
                        <Tag icon={<MessageOutlined />} style={{ marginLeft: '8px' }}>评论: {item.comments}</Tag>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          )) : (
            <Col span={24}>
              <Empty description="暂无帖子，快来发布第一个帖子吧！" />
            </Col>
          )}
        </Row>
      )}

      {total > 0 && (
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      )}

      <Modal
        title="发布帖子"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
        >
          {categories.length > 0 && (
            <Form.Item
              name="category_id"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类">
                {categories.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入帖子标题" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea 
              placeholder="请输入帖子内容" 
              rows={6}
              maxLength={2000}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setCreateModalVisible(false)} style={{ marginRight: '8px' }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={creating}>
              发布
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Forums;

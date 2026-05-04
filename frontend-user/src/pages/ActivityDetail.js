import React, { useEffect, useState } from 'react';
import { Card, Button, message, Spin, Space, Tag, Modal, Form, Input, Descriptions, Divider } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, HeartFilled, EnvironmentOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';

const ActivityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applyForm] = Form.useForm();
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchActivityDetail();
    checkFavorite();
  }, [id]);

  const fetchActivityDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/public/activities/${id}`);
      if (res.code === 200) {
        setActivity(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      message.error('获取活动详情失败');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.get('/api/favorite/check', {
        params: {
          type: 'activity',
          target_id: id
        }
      });
      if (res.code === 200) {
        setIsFavorited(res.data.is_favorited);
      }
    } catch (error) {
      console.error('Failed to check favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    try {
      const res = await api.post('/api/favorite', {
        type: 'activity',
        target_id: parseInt(id)
      });
      if (res.code === 200) {
        setIsFavorited(res.data.is_favorited);
        message.success(res.data.is_favorited ? '已收藏' : '已取消收藏');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleApply = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    if (activity.max_people > 0 && activity.joined_count >= activity.max_people) {
      message.warning('活动报名人数已满');
      return;
    }

    setApplyModalVisible(true);
  };

  const handleApplySubmit = async (values) => {
    setApplying(true);
    try {
      const res = await api.post('/api/activity/apply', {
        activity_id: parseInt(id),
        ...values
      });
      if (res.code === 200) {
        message.success('报名成功，请等待审核');
        setApplyModalVisible(false);
        applyForm.resetFields();
      } else {
        message.error(res.msg || '报名失败');
      }
    } catch (error) {
      message.error('报名失败，请稍后重试');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>活动不存在</p>
        <Button onClick={() => navigate('/activities')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/activities')}
        style={{ marginBottom: '16px' }}
      >
        返回列表
      </Button>

      <Card>
        <h1 className="detail-title">{activity.title}</h1>
        
        <div className="detail-meta">
          <Space>
            {activity.start_time && (
              <Tag icon={<CalendarOutlined />}>
                活动时间: {dayjs(activity.start_time).format('YYYY-MM-DD HH:mm')}
                {activity.end_time && ` ~ ${dayjs(activity.end_time).format('YYYY-MM-DD HH:mm')}`}
              </Tag>
            )}
            {activity.location && (
              <Tag icon={<EnvironmentOutlined />}>
                {activity.location}
              </Tag>
            )}
            <Tag icon={<UserOutlined />}>
              已报名: {activity.joined_count}
              {activity.max_people > 0 && ` / ${activity.max_people}人`}
            </Tag>
          </Space>
        </div>

        {activity.cover && (
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <img 
              src={activity.cover} 
              alt={activity.title}
              style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
            />
          </div>
        )}

        <Divider>活动详情</Divider>

        <div className="detail-content" dangerouslySetInnerHTML={{ __html: activity.content?.replace(/\n/g, '<br/>') }} />

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={handleApply}
            disabled={activity.max_people > 0 && activity.joined_count >= activity.max_people}
          >
            {activity.max_people > 0 && activity.joined_count >= activity.max_people ? '报名已满' : '立即报名'}
          </Button>
          <Button 
            size="large"
            type={isFavorited ? 'primary' : 'default'}
            icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
            onClick={toggleFavorite}
          >
            {isFavorited ? '已收藏' : '收藏'}
          </Button>
        </div>
      </Card>

      <Modal
        title="活动报名"
        open={applyModalVisible}
        onCancel={() => setApplyModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={applyForm}
          layout="vertical"
          onFinish={handleApplySubmit}
          className="apply-form"
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入您的姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input placeholder="请输入您的联系电话" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="报名理由"
          >
            <Input.TextArea 
              placeholder="请简单描述您的报名理由（可选）" 
              rows={4}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setApplyModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={applying}>
                确认报名
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ActivityDetail;

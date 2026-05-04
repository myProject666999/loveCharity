import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin, message } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  CalendarOutlined,
  MessageOutlined,
  EyeOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    activities: 0,
    news: 0,
    forums: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, activitiesRes, newsRes, forumsRes] = await Promise.all([
        api.get('/api/admin/users', { params: { page_size: 5 } }),
        api.get('/api/admin/activities', { params: { page_size: 5 } }),
        api.get('/api/admin/news', { params: { page_size: 5 } }),
        api.get('/api/admin/forums', { params: { page_size: 5 } }),
      ]);

      setStats({
        users: usersRes.code === 200 ? (usersRes.data.total || 0) : 0,
        activities: activitiesRes.code === 200 ? (activitiesRes.data.total || 0) : 0,
        news: newsRes.code === 200 ? (newsRes.data.total || 0) : 0,
        forums: forumsRes.code === 200 ? (forumsRes.data.total || 0) : 0,
      });

      if (usersRes.code === 200) {
        setRecentUsers(usersRes.data.list || []);
      }
      if (activitiesRes.code === 200) {
        setRecentActivities(activitiesRes.data.list || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (text) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD') : '-',
    },
  ];

  const activityColumns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      render: (text) => text || '-',
    },
    {
      title: '报名人数',
      dataIndex: 'joined_count',
      key: 'joined_count',
      render: (count, record) => (
        <span>{count}{record.max_people > 0 ? ` / ${record.max_people}` : ''}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '进行中' : '已结束'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">仪表盘</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="dashboard-stats">
            <Col xs={12} sm={6}>
              <Card className="stat-card" style={{ background: '#e6f7ff', border: 'none' }}>
                <Statistic
                  title="用户总数"
                  value={stats.users}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card" style={{ background: '#f6ffed', border: 'none' }}>
                <Statistic
                  title="活动总数"
                  value={stats.activities}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card" style={{ background: '#fff7e6', border: 'none' }}>
                <Statistic
                  title="新闻总数"
                  value={stats.news}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card" style={{ background: '#fff1f0', border: 'none' }}>
                <Statistic
                  title="帖子总数"
                  value={stats.forums}
                  prefix={<MessageOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col lg={12} span={24}>
              <Card title="最近注册用户" className="table-container">
                <Table
                  dataSource={recentUsers}
                  columns={userColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col lg={12} span={24}>
              <Card title="最近活动" className="table-container">
                <Table
                  dataSource={recentActivities}
                  columns={activityColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;
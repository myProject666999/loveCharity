import React, { useEffect, useState } from 'react';
import { Card, Button, Tag, Tabs, List, Empty, Spin, message, Popconfirm, Avatar } from 'antd';
import { 
  FileTextOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  HeartFilled,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

const getTypeIcon = (type) => {
  switch (type) {
    case 'news': return <FileTextOutlined />;
    case 'activity': return <CalendarOutlined />;
    case 'forum': return <TeamOutlined />;
    default: return <FileTextOutlined />;
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'news': return '新闻';
    case 'activity': return '活动';
    case 'forum': return '帖子';
    default: return '其他';
  }
};

const getNavPath = (type, id) => {
  switch (type) {
    case 'news': return `/news/${id}`;
    case 'activity': return `/activities/${id}`;
    case 'forum': return `/forums/${id}`;
    default: return '/';
  }
};

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, [page, activeTab]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };
      if (activeTab) {
        params.type = activeTab;
      }

      const res = await api.get('/api/favorites', { params });
      if (res.code === 200) {
        setFavorites(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      message.error('获取收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleRemoveFavorite = async (item) => {
    try {
      const res = await api.post('/api/favorite', {
        type: item.type,
        target_id: item.target_id
      });
      if (res.code === 200) {
        message.success('已取消收藏');
        fetchFavorites();
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>我的收藏</h2>
      </div>

      <Card>
        <Tabs defaultActiveKey="" activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="全部" key="" />
          <TabPane tab={<span><FileTextOutlined style={{ marginRight: '4px' }} />新闻</span>} key="news" />
          <TabPane tab={<span><CalendarOutlined style={{ marginRight: '4px' }} />活动</span>} key="activity" />
          <TabPane tab={<span><TeamOutlined style={{ marginRight: '4px' }} />帖子</span>} key="forum" />
        </Tabs>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <List
            dataSource={favorites}
            locale={{ emptyText: <Empty description="暂无收藏内容" /> }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<EyeOutlined />}
                    onClick={() => navigate(getNavPath(item.type, item.target_id))}
                  >
                    查看
                  </Button>,
                  <Popconfirm
                    title="确定要取消收藏吗？"
                    onConfirm={() => handleRemoveFavorite(item)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button 
                      type="link" 
                      size="small" 
                      danger
                      icon={<DeleteOutlined />}
                    >
                      取消收藏
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getTypeIcon(item.type)} 
                      style={{ 
                        backgroundColor: item.type === 'news' ? '#1890ff' : item.type === 'activity' ? '#52c41a' : '#fa8c16' 
                      }} 
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag>{getTypeLabel(item.type)}</Tag>
                      <span style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => navigate(getNavPath(item.type, item.target_id))}>
                        收藏ID: {item.target_id}
                      </span>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ color: '#999' }}>
                        收藏时间: {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {total > pageSize && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Button.Group>
              <Button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              <Button>
                第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页
              </Button>
              <Button
                disabled={page >= Math.ceil(total / pageSize)}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </Button.Group>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Favorites;
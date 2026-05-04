import React, { useEffect, useState } from 'react';
import { Card, Button, Tag, Pagination, Empty, Spin, Row, Col } from 'antd';
import { RightOutlined, ClockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Meta } = Card;

const Notices = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [topNotices, setTopNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopNotices();
    fetchNotices();
  }, [page]);

  const fetchTopNotices = async () => {
    try {
      const res = await api.get('/api/public/notices', {
        params: { is_top: 1, page_size: 10 }
      });
      if (res.code === 200) {
        setTopNotices(res.data.list || []);
      }
    } catch (error) {
      console.error('Failed to fetch top notices:', error);
    }
  };

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/public/notices', {
        params: {
          page,
          page_size: pageSize
        }
      });
      if (res.code === 200) {
        setNotices(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>公告资讯</h2>
      </div>

      {topNotices.length > 0 && (
        <Card 
          title={<span style={{ color: '#1890ff' }}>置顶公告</span>} 
          style={{ marginBottom: '24px', background: '#f6ffed', borderColor: '#b7eb8f' }}
        >
          <Row gutter={[16, 16]}>
            {topNotices.map(item => (
              <Col span={24} key={item.id}>
                <div 
                  style={{ 
                    padding: '12px 0', 
                    borderBottom: '1px dashed #d9d9d9',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/notices/${item.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag color="red">置顶</Tag>
                      <span style={{ fontSize: '16px', fontWeight: '500' }}>{item.title}</span>
                    </div>
                    <span style={{ color: '#999', fontSize: '12px' }}>
                      <ClockOutlined style={{ marginRight: '4px' }} />
                      {dayjs(item.created_at).format('YYYY-MM-DD')}
                    </span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      <Card title="公告列表">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {notices.length > 0 ? notices.map(item => (
              <Col span={24} key={item.id}>
                <Card
                  className="card-item"
                  hoverable
                  onClick={() => navigate(`/notices/${item.id}`)}
                  style={{ border: 'none', borderBottom: '1px solid #f0f0f0', borderRadius: 0 }}
                  bodyStyle={{ padding: '16px 0' }}
                >
                  <Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>
                          {item.title}
                          <RightOutlined style={{ marginLeft: '8px', fontSize: '12px', color: '#999' }} />
                        </span>
                        <span style={{ color: '#999', fontSize: '12px' }}>
                          {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                        </span>
                      </div>
                    }
                    description={
                      <div style={{ marginTop: '8px', color: '#666' }}>
                        <div style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {item.content}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            )) : (
              <Col span={24}>
                <Empty description="暂无公告" />
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
      </Card>
    </div>
  );
};

export default Notices;
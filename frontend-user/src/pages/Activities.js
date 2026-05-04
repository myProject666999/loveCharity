import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Tag, Pagination, Empty, Spin } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Meta } = Card;

const Activities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [page]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/public/activities', {
        params: {
          page,
          page_size: pageSize,
          status: 1
        }
      });
      if (res.code === 200) {
        setActivities(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2>志愿服务活动</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {activities.length > 0 ? activities.map(item => (
            <Col xs={24} sm={12} md={8} key={item.id}>
              <Card
                className="card-item"
                hoverable
                cover={
                  <div style={{ 
                    height: '180px', 
                    background: item.cover ? `url(${item.cover}) center/cover` : '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {!item.cover && <span style={{ color: '#999' }}>活动图片</span>}
                  </div>
                }
                onClick={() => navigate(`/activities/${item.id}`)}
              >
                <Meta
                  title={<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '16px', fontWeight: '500' }}>{item.title}</div>}
                  description={
                    <div>
                      {item.location && (
                        <div style={{ marginBottom: '4px' }}>
                          <EnvironmentOutlined style={{ marginRight: '4px' }} />
                          {item.location}
                        </div>
                      )}
                      {item.start_time && (
                        <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>
                          活动时间: {dayjs(item.start_time).format('YYYY-MM-DD HH:mm')}
                        </div>
                      )}
                      <div style={{ marginTop: '8px' }}>
                        <Tag color={item.max_people > 0 && item.joined_count >= item.max_people ? 'default' : 'processing'}>
                          <UserOutlined style={{ marginRight: '4px' }} />
                          已报名: {item.joined_count}
                          {item.max_people > 0 && ` / ${item.max_people}人`}
                        </Tag>
                        {item.max_people > 0 && item.joined_count >= item.max_people && (
                          <Tag color="default" style={{ marginLeft: '8px' }}>已满</Tag>
                        )}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          )) : (
            <Col span={24}>
              <Empty description="暂无活动" />
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
    </div>
  );
};

export default Activities;

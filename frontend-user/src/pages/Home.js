import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Carousel, Empty } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Meta } = Card;

const Home = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [news, setNews] = useState([]);
  const [activities, setActivities] = useState([]);
  const [forums, setForums] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bannersRes, newsRes, activitiesRes, forumsRes, noticesRes] = await Promise.all([
        api.get('/api/public/banners?status=1'),
        api.get('/api/public/news?page_size=8'),
        api.get('/api/public/activities?page_size=8'),
        api.get('/api/public/forums?page_size=8'),
        api.get('/api/public/notices?is_top=1&page_size=5'),
      ]);

      if (bannersRes.code === 200) setBanners(bannersRes.data.list || []);
      if (newsRes.code === 200) setNews(newsRes.data.list || []);
      if (activitiesRes.code === 200) setActivities(activitiesRes.data.list || []);
      if (forumsRes.code === 200) setForums(forumsRes.data.list || []);
      if (noticesRes.code === 200) setNotices(noticesRes.data.list || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const bannerItems = banners.length > 0 ? banners.map(banner => ({
    key: banner.id,
    children: (
      <div style={{ 
        height: '300px', 
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {banner.image ? (
          <img 
            src={banner.image} 
            alt={banner.title} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span>{banner.title || '爱心公益服务系统'}</span>
        )}
      </div>
    ),
  })) : [{
    key: 'default',
    children: (
      <div style={{ 
        height: '300px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '28px',
        fontWeight: 'bold'
      }}>
        欢迎来到爱心公益服务系统
      </div>
    ),
  }];

  return (
    <div>
      <div className="home-banner">
        <Carousel autoplay dots={true} effect="fade">
          {bannerItems}
        </Carousel>
      </div>

      {notices.length > 0 && (
        <div className="home-section">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px',
            padding: '12px 16px',
            background: '#e6f7ff',
            borderRadius: '4px'
          }}>
            <div style={{ fontWeight: '600', color: '#1890ff' }}>
              【公告】 {notices[0]?.title}
            </div>
            <Button type="link" onClick={() => navigate('/notices')}>
              更多 <RightOutlined />
            </Button>
          </div>
        </div>
      )}

      <div className="home-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="section-title">新闻资讯</h3>
          <Button type="link" onClick={() => navigate('/news')}>
            查看更多 <RightOutlined />
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {news.length > 0 ? news.slice(0, 4).map(item => (
            <Col xs={24} sm={12} md={6} key={item.id}>
              <Card
                className="card-item"
                hoverable
                cover={
                  <div style={{ 
                    height: '150px', 
                    background: item.cover ? `url(${item.cover}) center/cover` : '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {!item.cover && <span style={{ color: '#999' }}>暂无图片</span>}
                  </div>
                }
                onClick={() => navigate(`/news/${item.id}`)}
              >
                <Meta
                  title={<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>}
                  description={
                    <div style={{ color: '#999', fontSize: '12px' }}>
                      {item.author && `作者: ${item.author}`}
                      {item.views >= 0 && ` | 浏览: ${item.views}`}
                    </div>
                  }
                />
              </Card>
            </Col>
          )) : (
            <Col span={24}>
              <Empty description="暂无新闻" />
            </Col>
          )}
        </Row>
      </div>

      <div className="home-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="section-title">志愿服务活动</h3>
          <Button type="link" onClick={() => navigate('/activities')}>
            查看更多 <RightOutlined />
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {activities.length > 0 ? activities.slice(0, 4).map(item => (
            <Col xs={24} sm={12} md={6} key={item.id}>
              <Card
                className="card-item"
                hoverable
                cover={
                  <div style={{ 
                    height: '150px', 
                    background: item.cover ? `url(${item.cover}) center/cover` : '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {!item.cover && <span style={{ color: '#999' }}>暂无图片</span>}
                  </div>
                }
                onClick={() => navigate(`/activities/${item.id}`)}
              >
                <Meta
                  title={<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>}
                  description={
                    <div>
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        {item.location && `地点: ${item.location}`}
                      </div>
                      <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                        已报名: {item.joined_count}
                        {item.max_people > 0 && ` / ${item.max_people}人`}
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
      </div>

      <div className="home-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="section-title">论坛交流</h3>
          <Button type="link" onClick={() => navigate('/forums')}>
            查看更多 <RightOutlined />
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {forums.length > 0 ? forums.slice(0, 4).map(item => (
            <Col xs={24} sm={12} key={item.id}>
              <Card 
                className="card-item forum-card"
                hoverable
                onClick={() => navigate(`/forums/${item.id}`)}
              >
                <Meta
                  title={item.title}
                  description={
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ 
                        color: '#666', 
                        fontSize: '13px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {item.content}
                      </div>
                      <div style={{ marginTop: '8px', color: '#999', fontSize: '12px' }}>
                        浏览: {item.views} | 评论: {item.comments}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          )) : (
            <Col span={24}>
              <Empty description="暂无帖子" />
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default Home;

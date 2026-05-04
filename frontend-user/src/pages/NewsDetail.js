import React, { useEffect, useState } from 'react';
import { Card, Button, message, Spin, Space } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';

const NewsDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchNewsDetail();
    checkFavorite();
  }, [id]);

  const fetchNewsDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/public/news/${id}`);
      if (res.code === 200) {
        setNews(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      message.error('获取新闻详情失败');
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
          type: 'news',
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
        type: 'news',
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!news) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>新闻不存在</p>
        <Button onClick={() => navigate('/news')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/news')}
        style={{ marginBottom: '16px' }}
      >
        返回列表
      </Button>

      <Card>
        <h1 className="detail-title">{news.title}</h1>
        
        <div className="detail-meta">
          <Space>
            {news.author && <span>作者: {news.author}</span>}
            {news.views >= 0 && <span>浏览: {news.views}</span>}
            {news.created_at && <span>发布时间: {dayjs(news.created_at).format('YYYY-MM-DD HH:mm')}</span>}
          </Space>
        </div>

        {news.cover && (
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <img 
              src={news.cover} 
              alt={news.title}
              style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
            />
          </div>
        )}

        <div className="detail-content" dangerouslySetInnerHTML={{ __html: news.content?.replace(/\n/g, '<br/>') }} />

        <div style={{ marginTop: '32px', borderTop: '1px solid #f0f0f0', paddingTop: '16px', textAlign: 'right' }}>
          <Button 
            type={isFavorited ? 'primary' : 'default'}
            icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
            onClick={toggleFavorite}
          >
            {isFavorited ? '已收藏' : '收藏'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NewsDetail;

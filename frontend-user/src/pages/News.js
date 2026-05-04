import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Input, Pagination, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { Meta } = Card;

const News = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, [page, keyword]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
      };
      if (keyword) {
        params.keyword = keyword;
      }

      const res = await api.get('/api/public/news', { params });
      if (res.code === 200) {
        setNews(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setKeyword(value);
    setPage(1);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>新闻资讯</h2>
        <Input.Search
          placeholder="搜索新闻标题或内容"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ maxWidth: '400px' }}
          onSearch={handleSearch}
        />
      </div>

      <Row gutter={[16, 16]}>
        {!loading && news.length > 0 ? news.map(item => (
          <Col xs={24} sm={12} md={8} key={item.id}>
            <Card
              className="card-item"
              hoverable
              loading={loading}
              cover={
                <div style={{ 
                  height: '180px', 
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
                title={<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '16px' }}>{item.title}</div>}
                description={
                  <div>
                    <div style={{ 
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '40px'
                    }}>
                      {item.description || item.content}
                    </div>
                    <div style={{ marginTop: '8px', color: '#999', fontSize: '12px' }}>
                      {item.author && `作者: ${item.author}`}
                      {item.views >= 0 && ` | 浏览: ${item.views}`}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        )) : (
          <Col span={24}>
            {!loading && <Empty description="暂无新闻" />}
          </Col>
        )}
      </Row>

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

export default News;

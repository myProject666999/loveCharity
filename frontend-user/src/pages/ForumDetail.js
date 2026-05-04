import React, { useEffect, useState } from 'react';
import { Card, Button, message, Spin, Space, Tag, Input, List, Avatar, Divider, Empty } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, HeartFilled, EyeOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ForumDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [forum, setForum] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsPageSize] = useState(10);

  useEffect(() => {
    fetchForumDetail();
    checkFavorite();
    fetchComments();
  }, [id]);

  const fetchForumDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/public/forum/${id}`);
      if (res.code === 200) {
        setForum(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch forum:', error);
      message.error('获取帖子详情失败');
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
          type: 'forum',
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
        type: 'forum',
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

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await api.get('/api/public/comments', {
        params: {
          forum_id: id,
          page: commentsPage,
          page_size: commentsPageSize
        }
      });
      if (res.code === 200) {
        setComments(res.data.list || []);
        setCommentsTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/comment', {
        forum_id: parseInt(id),
        content: newComment.trim()
      });
      if (res.code === 200) {
        message.success('评论成功');
        setNewComment('');
        setCommentsPage(1);
        fetchComments();
        fetchForumDetail();
      } else {
        message.error(res.msg || '评论失败');
      }
    } catch (error) {
      message.error('评论失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!forum) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>帖子不存在</p>
        <Button onClick={() => navigate('/forums')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/forums')}
        style={{ marginBottom: '16px' }}
      >
        返回列表
      </Button>

      <Card style={{ marginBottom: '24px' }}>
        <h1 className="detail-title" style={{ marginBottom: '16px' }}>{forum.title}</h1>
        
        <div className="detail-meta" style={{ marginBottom: '24px' }}>
          <Space>
            <Tag icon={<UserOutlined />}>
              {forum.user?.username || '匿名用户'}
            </Tag>
            <Tag icon={<EyeOutlined />}>
              浏览: {forum.views}
            </Tag>
            <Tag icon={<MessageOutlined />}>
              评论: {forum.comments}
            </Tag>
            {forum.created_at && (
              <span style={{ color: '#999' }}>
                发布时间: {dayjs(forum.created_at).format('YYYY-MM-DD HH:mm')}
              </span>
            )}
          </Space>
        </div>

        <div className="detail-content" style={{ padding: '16px 0', minHeight: '100px', lineHeight: '1.8' }}>
          {forum.content?.split('\n').map((line, index) => (
            <p key={index} style={{ marginBottom: '8px' }}>{line}</p>
          ))}
        </div>

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

      <Card title={`发表评论 (${forum.comments})`}>
        <div style={{ marginBottom: '24px' }}>
          <TextArea
            placeholder="请输入您的评论..."
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={500}
            showCount
          />
          <div style={{ marginTop: '12px', textAlign: 'right' }}>
            <Button 
              type="primary" 
              onClick={handleCommentSubmit}
              loading={submitting}
            >
              发表评论
            </Button>
          </div>
        </div>

        <Divider>评论列表</Divider>

        {commentsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : (
          <List
            dataSource={comments}
            locale={{ emptyText: <Empty description="暂无评论，快来发表第一条评论吧！" /> }}
            renderItem={(comment) => (
              <List.Item key={comment.id}>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Space>
                      <span style={{ fontWeight: '500' }}>
                        {comment.user?.username || '匿名用户'}
                      </span>
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        {dayjs(comment.created_at).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </Space>
                  }
                  description={
                    <div style={{ marginTop: '8px', color: '#333', lineHeight: '1.6' }}>
                      {comment.content}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {commentsTotal > commentsPageSize && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Button.Group>
              <Button
                disabled={commentsPage <= 1}
                onClick={() => {
                  setCommentsPage(commentsPage - 1);
                  setTimeout(fetchComments, 0);
                }}
              >
                上一页
              </Button>
              <Button>
                第 {commentsPage} 页 / 共 {Math.ceil(commentsTotal / commentsPageSize)} 页
              </Button>
              <Button
                disabled={commentsPage >= Math.ceil(commentsTotal / commentsPageSize)}
                onClick={() => {
                  setCommentsPage(commentsPage + 1);
                  setTimeout(fetchComments, 0);
                }}
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

export default ForumDetail;
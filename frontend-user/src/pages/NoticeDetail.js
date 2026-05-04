import React, { useEffect, useState } from 'react';
import { Card, Button, message, Spin, Space, Tag } from 'antd';
import { ArrowLeftOutlined, ClockOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';

const NoticeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNoticeDetail();
  }, [id]);

  const fetchNoticeDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/public/notice/${id}`);
      if (res.code === 200) {
        setNotice(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch notice:', error);
      message.error('获取公告详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!notice) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>公告不存在</p>
        <Button onClick={() => navigate('/notices')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/notices')}
        style={{ marginBottom: '16px' }}
      >
        返回列表
      </Button>

      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Space>
            {notice.is_top === 1 && <Tag color="red">置顶</Tag>}
          </Space>
          <h1 className="detail-title" style={{ margin: '16px 0' }}>{notice.title}</h1>
          <div style={{ color: '#999' }}>
            <Space>
              <Tag icon={<ClockOutlined />}>
                发布时间: {dayjs(notice.created_at).format('YYYY-MM-DD HH:mm')}
              </Tag>
              {notice.updated_at && (
                <Tag>
                  更新时间: {dayjs(notice.updated_at).format('YYYY-MM-DD HH:mm')}
                </Tag>
              )}
            </Space>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '24px 0' }} />

        <div className="detail-content" style={{ padding: '0 16px', lineHeight: '1.8', fontSize: '15px' }}>
          {notice.content?.split('\n').map((line, index) => (
            <p key={index} style={{ marginBottom: '12px', textIndent: '2em' }}>
              {line}
            </p>
          ))}
        </div>

        <div style={{ marginTop: '48px', borderTop: '1px solid #f0f0f0', paddingTop: '24px', textAlign: 'center' }}>
          <Button onClick={() => navigate('/notices')}>
            返回公告列表
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NoticeDetail;
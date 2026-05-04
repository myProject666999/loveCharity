import React, { useEffect, useState } from 'react';
import { Card, Button, Tag, List, Empty, Spin, message, Descriptions, Divider, Modal, Tabs } from 'antd';
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  UserOutlined,
  PhoneOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

const getStatusText = (status) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '已拒绝';
    default: return '未知';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 0: return 'orange';
    case 1: return 'green';
    case 2: return 'red';
    default: return 'default';
  }
};

const MyApplies = () => {
  const navigate = useNavigate();
  const [applies, setApplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('-1');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentApply, setCurrentApply] = useState(null);

  useEffect(() => {
    fetchApplies();
  }, [page, activeTab]);

  const fetchApplies = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };
      if (activeTab !== '-1') {
        params.status = parseInt(activeTab);
      }

      const res = await api.get('/api/my/applies', { params });
      if (res.code === 200) {
        setApplies(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch applies:', error);
      message.error('获取报名列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleViewDetail = (item) => {
    setCurrentApply(item);
    setDetailModalVisible(true);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>我的报名</h2>
      </div>

      <Card>
        <Tabs defaultActiveKey="-1" activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="全部" key="-1" />
          <TabPane tab={<span><Tag color="orange">待审核</Tag></span>} key="0" />
          <TabPane tab={<span><Tag color="green">已通过</Tag></span>} key="1" />
          <TabPane tab={<span><Tag color="red">已拒绝</Tag></span>} key="2" />
        </Tabs>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <List
            dataSource={applies}
            locale={{ emptyText: <Empty description="暂无报名记录" /> }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => handleViewDetail(item)}
                  >
                    查看详情
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: '500', marginRight: '12px' }}>
                          活动ID: {item.activity_id}
                        </span>
                        <Tag color={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Tag>
                      </div>
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        报名时间: {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: '12px' }}>
                      <Descriptions column={4} size="small">
                        <Descriptions.Item label="报名人">
                          <span style={{ color: '#666' }}>{item.name}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="联系电话">
                          <span style={{ color: '#666' }}>{item.phone}</span>
                        </Descriptions.Item>
                        {item.reason && (
                          <Descriptions.Item label="报名理由" span={2}>
                            <span style={{ color: '#666' }}>{item.reason}</span>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                      {item.remark && (
                        <div style={{ marginTop: '8px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                          <span style={{ color: '#fa8c16' }}>审核备注: {item.remark}</span>
                        </div>
                      )}
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

      <Modal
        title="报名详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {currentApply && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="活动ID">{currentApply.activity_id}</Descriptions.Item>
              <Descriptions.Item label="报名人">{currentApply.name}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentApply.phone}</Descriptions.Item>
              <Descriptions.Item label="报名理由">
                {currentApply.reason || '无'}
              </Descriptions.Item>
              <Descriptions.Item label="报名状态">
                <Tag color={getStatusColor(currentApply.status)}>
                  {getStatusText(currentApply.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审核备注">
                {currentApply.remark || '无'}
              </Descriptions.Item>
              <Descriptions.Item label="报名时间">
                {dayjs(currentApply.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {dayjs(currentApply.updated_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyApplies;
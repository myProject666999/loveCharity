import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  Tag, 
  List, 
  Empty, 
  Spin, 
  message, 
  Descriptions, 
  Modal, 
  Tabs,
  Form,
  Input,
  Divider
} from 'antd';
import { 
  MessageOutlined, 
  PhoneOutlined, 
  MailOutlined,
  UserOutlined,
  PlusOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;

const getStatusText = (status) => {
  switch (status) {
    case 0: return '待回复';
    case 1: return '已回复';
    default: return '未知';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 0: return 'orange';
    case 1: return 'green';
    default: return 'default';
  }
};

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('-1');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [createForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [page, activeTab]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };
      if (activeTab !== '-1') {
        params.status = parseInt(activeTab);
      }

      const res = await api.get('/api/my/messages', { params });
      if (res.code === 200) {
        setMessages(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      message.error('获取留言列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleViewDetail = (item) => {
    setCurrentMessage(item);
    setDetailModalVisible(true);
  };

  const handleCreateSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await api.post('/api/message', values);
      if (res.code === 200) {
        message.success('留言提交成功，请等待回复');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchMessages();
      } else {
        message.error(res.msg || '提交失败');
      }
    } catch (error) {
      message.error('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>我的留言</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          提交留言
        </Button>
      </div>

      <Card>
        <Tabs defaultActiveKey="-1" activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="全部" key="-1" />
          <TabPane tab={<span><Tag color="orange">待回复</Tag></span>} key="0" />
          <TabPane tab={<span><Tag color="green">已回复</Tag></span>} key="1" />
        </Tabs>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <List
            dataSource={messages}
            locale={{ emptyText: <Empty description="暂无留言记录" /> }}
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
                  avatar={<MessageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div>
                        <Tag color={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Tag>
                        {item.name && (
                          <span style={{ marginLeft: '12px', color: '#666' }}>
                            <UserOutlined style={{ marginRight: '4px' }} />
                            {item.name}
                          </span>
                        )}
                      </div>
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        提交时间: {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ 
                        color: '#333', 
                        padding: '12px', 
                        background: '#f5f5f5', 
                        borderRadius: '4px',
                        marginBottom: '8px'
                      }}>
                        {item.content}
                      </div>
                      {item.reply && (
                        <div style={{ padding: '12px', background: '#e6f7ff', borderRadius: '4px', borderLeft: '4px solid #1890ff' }}>
                          <span style={{ color: '#1890ff', fontWeight: '500' }}>管理员回复: </span>
                          <span style={{ color: '#333' }}>{item.reply}</span>
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
        title="提交留言"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
        >
          <Form.Item
            name="name"
            label="联系人姓名"
          >
            <Input placeholder="请输入您的姓名（选填）" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input placeholder="请输入您的联系电话（选填）" maxLength={20} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入您的邮箱（选填）" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="content"
            label="留言内容"
            rules={[{ required: true, message: '请输入留言内容' }]}
          >
            <TextArea 
              placeholder="请输入您的留言内容" 
              rows={6}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setCreateModalVisible(false)} style={{ marginRight: '8px' }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="留言详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {currentMessage && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="联系人">{currentMessage.name || '无'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentMessage.phone || '无'}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{currentMessage.email || '无'}</Descriptions.Item>
              <Descriptions.Item label="留言状态">
                <Tag color={getStatusColor(currentMessage.status)}>
                  {getStatusText(currentMessage.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="提交时间" span={2}>
                {dayjs(currentMessage.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px', color: '#666' }}>留言内容:</h4>
              <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px', minHeight: '60px' }}>
                {currentMessage.content}
              </div>
            </div>

            {currentMessage.reply && (
              <div>
                <h4 style={{ marginBottom: '8px', color: '#1890ff' }}>管理员回复:</h4>
                <div style={{ padding: '12px', background: '#e6f7ff', borderRadius: '4px', borderLeft: '4px solid #1890ff', minHeight: '60px' }}>
                  {currentMessage.reply}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Messages;
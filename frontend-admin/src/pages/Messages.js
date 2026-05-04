import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Spin, 
  message, 
  Modal,
  Form,
  Input,
  Space,
  Descriptions,
  Divider,
  Select
} from 'antd';
import { 
  ReloadOutlined,
  EyeOutlined,
  MessageOutlined,
  EditOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const Messages = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(-1);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [replyForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [page, statusFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };
      if (statusFilter >= 0) {
        params.status = statusFilter;
      }

      const res = await api.get('/api/admin/messages', { params });
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

  const handleViewDetail = (record) => {
    setCurrentMessage(record);
    setDetailModalVisible(true);
  };

  const handleReply = (record) => {
    setCurrentMessage(record);
    replyForm.setFieldsValue({
      reply: record.reply || '',
    });
    setReplyModalVisible(true);
  };

  const handleReplySubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await api.post(`/api/admin/message/reply/${currentMessage.id}`, {
        reply: values.reply || '',
      });
      if (res.code === 200) {
        message.success('回复成功');
        setReplyModalVisible(false);
        fetchMessages();
      } else {
        message.error(res.msg || '回复失败');
      }
    } catch (error) {
      message.error('回复失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '联系人',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (text) => text || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '留言内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 180,
      render: (text) => text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '留言时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleReply(record)}
          >
            {record.status === 1 ? '编辑回复' : '回复'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">留言管理</h2>
        <Space>
          <Select
            style={{ width: 120 }}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={[
              { label: '全部状态', value: -1 },
              { label: '待回复', value: 0 },
              { label: '已回复', value: 1 },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchMessages}>
            刷新
          </Button>
        </Space>
      </div>

      <Card className="table-container">
        <Table
          columns={columns}
          dataSource={messages}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

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
            <Descriptions column={1} size="small" style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="联系人">{currentMessage.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentMessage.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{currentMessage.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(currentMessage.status)}>
                  {getStatusText(currentMessage.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="留言时间">
                {currentMessage.created_at ? dayjs(currentMessage.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider>留言内容</Divider>
            
            <div style={{ 
              padding: '16px', 
              background: '#f5f5f5', 
              borderRadius: '4px',
              minHeight: '60px',
              marginBottom: '16px'
            }}>
              {currentMessage.content || '无内容'}
            </div>

            {currentMessage.reply && (
              <>
                <Divider>管理员回复</Divider>
                <div style={{ 
                  padding: '16px', 
                  background: '#e6f7ff', 
                  borderRadius: '4px',
                  borderLeft: '4px solid #1890ff',
                  minHeight: '60px'
                }}>
                  {currentMessage.reply}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="回复留言"
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        footer={null}
        width={500}
      >
        {currentMessage && (
          <div>
            <div style={{ 
              padding: '12px', 
              background: '#f5f5f5', 
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              <div style={{ color: '#666', marginBottom: '4px' }}>用户留言：</div>
              <div>{currentMessage.content}</div>
            </div>

            <Form
              form={replyForm}
              layout="vertical"
              onFinish={handleReplySubmit}
            >
              <Form.Item
                name="reply"
                label="回复内容"
                rules={[{ required: true, message: '请输入回复内容' }]}
              >
                <TextArea placeholder="请输入回复内容" rows={6} maxLength={1000} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Button onClick={() => setReplyModalVisible(false)} style={{ marginRight: '8px' }}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  提交回复
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Messages;
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Spin, 
  message, 
  Popconfirm,
  Modal,
  Space,
  Descriptions,
  Divider,
  Select
} from 'antd';
import { 
  ReloadOutlined,
  EyeOutlined,
  MessageOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const Forums = () => {
  const [loading, setLoading] = useState(false);
  const [forums, setForums] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(-1);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentForum, setCurrentForum] = useState(null);

  useEffect(() => {
    fetchForums();
  }, [page, statusFilter]);

  const fetchForums = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };
      if (statusFilter >= 0) {
        params.status = statusFilter;
      }

      const res = await api.get('/api/admin/forums', { params });
      if (res.code === 200) {
        setForums(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch forums:', error);
      message.error('获取帖子列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setCurrentForum(record);
    setDetailModalVisible(true);
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      const res = await api.put(`/api/admin/forum/status/${id}`, {
        status: newStatus
      });
      if (res.code === 200) {
        message.success(`已${newStatus === 1 ? '恢复' : '屏蔽'}该帖子`);
        fetchForums();
      } else {
        message.error(res.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败，请稍后重试');
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
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 200,
    },
    {
      title: '内容摘要',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 200,
      render: (text) => text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : '-',
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 100,
    },
    {
      title: '评论数',
      dataIndex: 'comments',
      key: 'comments',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '屏蔽'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
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
          <Popconfirm
            title={`确定要${record.status === 1 ? '屏蔽' : '恢复'}该帖子吗？`}
            onConfirm={() => handleStatusChange(record.id, record.status)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              size="small"
              danger={record.status === 1}
            >
              {record.status === 1 ? '屏蔽' : '恢复'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">论坛管理</h2>
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
              { label: '正常', value: 1 },
              { label: '屏蔽', value: 0 },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchForums}>
            刷新
          </Button>
        </Space>
      </div>

      <Card className="table-container">
        <Table
          columns={columns}
          dataSource={forums}
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
        title="帖子详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {currentForum && (
          <div>
            <Descriptions column={1} size="small" style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="标题">{currentForum.title}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={currentForum.status === 1 ? 'green' : 'red'}>
                  {currentForum.status === 1 ? '正常' : '屏蔽'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="浏览量">{currentForum.views || 0}</Descriptions.Item>
              <Descriptions.Item label="评论数">{currentForum.comments || 0}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {currentForum.created_at ? dayjs(currentForum.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider>帖子内容</Divider>
            
            <div style={{ 
              padding: '16px', 
              background: '#f5f5f5', 
              borderRadius: '4px',
              minHeight: '100px',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8'
            }}>
              {currentForum.content || '无内容'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Forums;
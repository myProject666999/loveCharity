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
  Select,
  Space,
  Descriptions,
  Divider
} from 'antd';
import { 
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const Applies = () => {
  const [loading, setLoading] = useState(false);
  const [applies, setApplies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(-1);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentApply, setCurrentApply] = useState(null);
  const [auditForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplies();
  }, [page, statusFilter]);

  const fetchApplies = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };
      if (statusFilter >= 0) {
        params.status = statusFilter;
      }

      const res = await api.get('/api/admin/applies', { params });
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

  const handleViewDetail = (record) => {
    setCurrentApply(record);
    setDetailModalVisible(true);
  };

  const handleAudit = (record) => {
    setCurrentApply(record);
    auditForm.resetFields();
    setAuditModalVisible(true);
  };

  const handleAuditSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await api.put(`/api/admin/apply/audit/${currentApply.id}`, {
        status: parseInt(values.status),
        remark: values.remark || '',
      });
      if (res.code === 200) {
        message.success('审核成功');
        setAuditModalVisible(false);
        fetchApplies();
      } else {
        message.error(res.msg || '审核失败');
      }
    } catch (error) {
      message.error('审核失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '活动ID',
      dataIndex: 'activity_id',
      key: 'activity_id',
      width: 100,
    },
    {
      title: '报名人',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '报名理由',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      width: 150,
      render: (text) => text || '-',
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
      title: '审核备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '报名时间',
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
          {record.status === 0 && (
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleAudit(record)}
            >
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">报名审核</h2>
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
              { label: '待审核', value: 0 },
              { label: '已通过', value: 1 },
              { label: '已拒绝', value: 2 },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchApplies}>
            刷新
          </Button>
        </Space>
      </div>

      <Card className="table-container">
        <Table
          columns={columns}
          dataSource={applies}
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
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="ID">{currentApply.id}</Descriptions.Item>
              <Descriptions.Item label="活动ID">{currentApply.activity_id}</Descriptions.Item>
              <Descriptions.Item label="报名人">{currentApply.name}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentApply.phone}</Descriptions.Item>
              <Descriptions.Item label="报名理由">{currentApply.reason || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(currentApply.status)}>
                  {getStatusText(currentApply.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审核备注">{currentApply.remark || '-'}</Descriptions.Item>
              <Descriptions.Item label="报名时间">
                {currentApply.created_at ? dayjs(currentApply.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title="审核报名"
        open={auditModalVisible}
        onCancel={() => setAuditModalVisible(false)}
        footer={null}
        width={500}
      >
        {currentApply && (
          <div>
            <Descriptions column={1} size="small" style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="报名人">{currentApply.name}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentApply.phone}</Descriptions.Item>
              <Descriptions.Item label="报名理由">{currentApply.reason || '-'}</Descriptions.Item>
            </Descriptions>
            
            <Divider />

            <Form
              form={auditForm}
              layout="vertical"
              onFinish={handleAuditSubmit}
            >
              <Form.Item
                name="status"
                label="审核结果"
                rules={[{ required: true, message: '请选择审核结果' }]}
              >
                <Select placeholder="请选择审核结果">
                  <Option value={1}>
                    <Tag color="green" icon={<CheckOutlined />}>通过</Tag>
                  </Option>
                  <Option value={2}>
                    <Tag color="red" icon={<CloseOutlined />}>拒绝</Tag>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="remark"
                label="审核备注"
              >
                <TextArea placeholder="请输入审核备注（可选）" rows={4} maxLength={500} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Button onClick={() => setAuditModalVisible(false)} style={{ marginRight: '8px' }}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  确认审核
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Applies;
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
  Form,
  Input,
  Select,
  Switch,
  Space,
  DatePicker,
  InputNumber
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  ReloadOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Activities = () => {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchActivities();
    fetchCategories();
  }, [page]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/activities', {
        params: {
          page,
          page_size: pageSize
        }
      });
      if (res.code === 200) {
        setActivities(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      message.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/public/categories', {
        params: { type: 'activity' }
      });
      if (res.code === 200) {
        setCategories(res.data.list || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      const data = {
        ...values,
        status: values.status ? 1 : 0,
        start_time: values.time_range?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        end_time: values.time_range?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
      };
      delete data.time_range;

      const res = await api.post('/api/admin/activity', data);
      if (res.code === 200) {
        message.success('创建成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchActivities();
      } else {
        message.error(res.msg || '创建失败');
      }
    } catch (error) {
      message.error('创建失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setCurrentActivity(record);
    const timeRange = [];
    if (record.start_time) {
      timeRange[0] = dayjs(record.start_time);
    }
    if (record.end_time) {
      timeRange[1] = dayjs(record.end_time);
    }
    
    editForm.setFieldsValue({
      title: record.title,
      category_id: record.category_id,
      location: record.location || '',
      content: record.content || '',
      cover: record.cover || '',
      max_people: record.max_people || 0,
      status: record.status === 1,
      time_range: timeRange.length > 0 ? timeRange : null,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    setSubmitting(true);
    try {
      const data = {
        ...values,
        status: values.status ? 1 : 0,
        start_time: values.time_range?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        end_time: values.time_range?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
      };
      delete data.time_range;

      const res = await api.put(`/api/admin/activity/${currentActivity.id}`, data);
      if (res.code === 200) {
        message.success('更新成功');
        setEditModalVisible(false);
        fetchActivities();
      } else {
        message.error(res.msg || '更新失败');
      }
    } catch (error) {
      message.error('更新失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      const res = await api.put(`/api/admin/activity/status/${id}`, {
        status: newStatus
      });
      if (res.code === 200) {
        message.success(`已${newStatus === 1 ? '启用' : '禁用'}该活动`);
        fetchActivities();
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
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 180,
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '报名人数',
      key: 'joined',
      width: 100,
      render: (_, record) => (
        <span>
          {record.joined_count}
          {record.max_people > 0 && ` / ${record.max_people}`}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '进行中' : '已结束'}
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title={`确定要${record.status === 1 ? '结束' : '启用'}该活动吗？`}
            onConfirm={() => handleStatusChange(record.id, record.status)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              size="small"
              danger={record.status === 1}
            >
              {record.status === 1 ? '结束' : '启用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">活动管理</h2>
        <Space>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => setCreateModalVisible(true)}>
            新增活动
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchActivities}>
            刷新
          </Button>
        </Space>
      </div>

      <Card className="table-container">
        <Table
          columns={columns}
          dataSource={activities}
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
        title="新增活动"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ status: true, max_people: 0 }}
        >
          <Form.Item
            name="title"
            label="活动名称"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input placeholder="请输入活动名称" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="分类"
          >
            <Select placeholder="请选择分类">
              {categories.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="活动地点"
          >
            <Input placeholder="请输入活动地点" maxLength={200} prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Form.Item
            name="time_range"
            label="活动时间"
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="max_people"
            label="最大人数"
          >
            <InputNumber 
              min={0} 
              placeholder="0表示不限制" 
              style={{ width: '100%' }}
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="cover"
            label="封面图片"
          >
            <Input placeholder="请输入封面图片URL（可选）" maxLength={255} />
          </Form.Item>

          <Form.Item
            name="content"
            label="活动内容"
            rules={[{ required: true, message: '请输入活动内容' }]}
          >
            <TextArea placeholder="请输入活动内容" rows={6} maxLength={5000} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="进行中" unCheckedChildren="已结束" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setCreateModalVisible(false)} style={{ marginRight: '8px' }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑活动"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="title"
            label="活动名称"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input placeholder="请输入活动名称" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="分类"
          >
            <Select placeholder="请选择分类">
              {categories.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="活动地点"
          >
            <Input placeholder="请输入活动地点" maxLength={200} prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Form.Item
            name="time_range"
            label="活动时间"
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="max_people"
            label="最大人数"
          >
            <InputNumber 
              min={0} 
              placeholder="0表示不限制" 
              style={{ width: '100%' }}
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="cover"
            label="封面图片"
          >
            <Input placeholder="请输入封面图片URL（可选）" maxLength={255} />
          </Form.Item>

          <Form.Item
            name="content"
            label="活动内容"
            rules={[{ required: true, message: '请输入活动内容' }]}
          >
            <TextArea placeholder="请输入活动内容" rows={6} maxLength={5000} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="进行中" unCheckedChildren="已结束" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setEditModalVisible(false)} style={{ marginRight: '8px' }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Activities;
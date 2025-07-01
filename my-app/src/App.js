import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, InputNumber, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';

const App = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    handleSearch(searchTerm);
  }, [data]);

  const handleSearch = debounce((value) => {
    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase()) ||
      dayjs(item.date).format('YYYY-MM-DD').includes(value) ||
      item.value.toString().includes(value)
    );
    setFilteredData(filtered);
  }, 300);

  const onSearchChange = e => {
    setSearchTerm(e.target.value);
    handleSearch(e.target.value);
  };

  const showAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = record => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = id => {
    setData(prev => prev.filter(item => item.id !== id));
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        const newData = {
          ...values,
          id: editingRecord ? editingRecord.id : Date.now(),
          date: values.date.format('YYYY-MM-DD'),
        };
        if (editingRecord) {
          setData(prev => prev.map(item => (item.id === editingRecord.id ? newData : item)));
        } else {
          setData(prev => [...prev, newData]);
        }
        setIsModalVisible(false);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const columns = [
    {
      title: 'Имя',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Число',
      dataIndex: 'value',
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: 'Действия',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Input.Search
        placeholder="Поиск"
        value={searchTerm}
        onChange={onSearchChange}
        style={{ marginBottom: 16, maxWidth: 300 }}
        allowClear
      />
      <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>
        Добавить
      </Button>
      <Table columns={columns} dataSource={filteredData} rowKey="id" />

      <Modal
        title={editingRecord ? 'Редактировать запись' : 'Добавить запись'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Сохранить"
      >
        <Form form={form} layout="vertical" name="form_in_modal">
          <Form.Item
            name="name"
            label="Имя"
            rules={[{ required: true, message: 'Введите имя' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="date"
            label="Дата"
            rules={[{ required: true, message: 'Выберите дату' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="value"
            label="Числовое значение"
            rules={[
              { required: true, message: 'Введите число' },
              { type: 'number', min: 0, message: 'Число должно быть положительным' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};


export default App;

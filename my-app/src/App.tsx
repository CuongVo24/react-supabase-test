import { useEffect, useState, useMemo } from 'react';
import { supabase } from './supabaseClient';

interface Employee {
  id: number;
  created_at: string;
  name: string;
  avatar: string;
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');

  // State cho form thêm nhân viên
  const [addName, setAddName] = useState('');
  const [addAvatar, setAddAvatar] = useState('');
  const [allAvatars, setAllAvatars] = useState<string[]>([]);

  // Lọc ra avatar chưa được nhân viên nào sử dụng
  const availableAvatars = useMemo(() => {
    const usedAvatars = new Set(employees.map(e => e.avatar));
    return allAvatars.filter(a => !usedAvatars.has(a));
  }, [allAvatars, employees]);

  const fetchEmployees = async () => {
    const { data } = await supabase.from('Employee').select('*').order('id');
    if (data) setEmployees(data);
  };

  // Lấy danh sách tất cả avatar từ Storage bucket
  const fetchAvatars = async () => {
    const { data, error } = await supabase.storage.from('avatars').list('', { limit: 100 });
    if (error) {
      console.error('Lỗi lấy danh sách avatar:', error);
    } else if (data) {
      console.log('Dữ liệu avatar lấy được:', data);
      const names = data.map(f => f.name).filter(n => n && n !== '.emptyFolderPlaceholder');
      setAllAvatars(names);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAvatars();
  }, []);

  // Auto-select avatar đầu tiên còn trống
  useEffect(() => {
    if (availableAvatars.length > 0 && !availableAvatars.includes(addAvatar)) {
      setAddAvatar(availableAvatars[0]);
    } else if (availableAvatars.length === 0) {
      setAddAvatar('');
    }
  }, [availableAvatars]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getImgUrl = (name: string) => supabase.storage.from('avatars').getPublicUrl(name).data.publicUrl;

  // Thêm nhân viên mới
  const addEmp = async () => {
    if (!addName.trim()) {
      alert('Vui lòng nhập tên nhân viên!');
      return;
    }
    if (!addAvatar) {
      alert('Vui lòng chọn avatar!');
      return;
    }
    const { error } = await supabase.from('Employee').insert({ name: addName.trim(), avatar: addAvatar });
    if (error) {
      console.error('Insert error:', error);
      alert(`Thêm thất bại: ${error.message}`);
    } else {
      setAddName('');
      fetchEmployees();
    }
  };

  const deleteEmp = async (id: number) => {
    const { error } = await supabase.from('Employee').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      alert(`Xóa thất bại: ${error.message}`);
    }
    fetchEmployees();
  };

  const updateEmp = async (id: number) => {
    const { error } = await supabase.from('Employee').update({ name: newName }).eq('id', id);
    if (error) {
      console.error('Update error:', error);
      alert(`Cập nhật thất bại: ${error.message}`);
    }
    setEditingId(null);
    fetchEmployees();
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Quản lý Nhân viên</h1>

      {/* Form thêm nhân viên */}
      <div style={{ marginBottom: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ margin: '0 0 12px' }}>➕ Thêm nhân viên mới</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            value={addName}
            onChange={e => setAddName(e.target.value)}
            placeholder="Nhập tên nhân viên..."
            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', minWidth: '200px' }}
          />
          <select
            value={addAvatar}
            onChange={e => setAddAvatar(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
          >
            {availableAvatars.length === 0 && <option value="">-- Hết avatar khả dụng --</option>}
            {availableAvatars.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          {addAvatar && (
            <img src={getImgUrl(addAvatar)} width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <button
            onClick={addEmp}
            style={{ padding: '8px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
          >
            Thêm
          </button>
        </div>
      </div>

      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>Avatar</th><th>Tên</th><th>Ngày tạo</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td style={{ textAlign: 'center' }}>
                <img src={getImgUrl(emp.avatar)} width="50" height="50" style={{ borderRadius: '50%' }} />
              </td>
              <td>
                {editingId === emp.id ? 
                  <input value={newName} onChange={e => setNewName(e.target.value)} /> : emp.name}
              </td>
              <td>{formatDate(emp.created_at)}</td>
              <td>
                {editingId === emp.id ? (
                  <button onClick={() => updateEmp(emp.id)}>Lưu</button>
                ) : (
                  <button onClick={() => { setEditingId(emp.id); setNewName(emp.name); }}>Sửa</button>
                )}
                <button onClick={() => deleteEmp(emp.id)} style={{ color: 'red', marginLeft: '10px' }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
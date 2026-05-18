import { useEffect, useState } from 'react';
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

  const fetchEmployees = async () => {
    const { data } = await supabase.from('Employee').select('*').order('id');
    if (data) setEmployees(data);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getImgUrl = (name: string) => supabase.storage.from('avatars').getPublicUrl(name).data.publicUrl;

  const deleteEmp = async (id: number) => {
    await supabase.from('Employee').delete().eq('id', id);
    fetchEmployees();
  };

  const updateEmp = async (id: number) => {
    await supabase.from('Employee').update({ name: newName }).eq('id', id);
    setEditingId(null);
    fetchEmployees();
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Quản lý Nhân viên</h1>
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
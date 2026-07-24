import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useTeacherStore } from '../../stores/useTeacherStore.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { TeacherForm } from './TeacherForm.jsx';

export const TeacherList = () => {
  const { teachers, pagination, loading, error, filters, setFilters, fetchTeachers, deleteTeacher } = useTeacherStore();
  
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, filters.search, setFilters]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handlePageChange = (newPage) => {
    setFilters({ page: newPage });
  };

  const handleFilterChange = (e) => {
    setFilters({ [e.target.name]: e.target.value, page: 1 });
  };

  const openAddForm = () => {
    setEditingTeacher(null);
    setIsFormOpen(true);
  };

  const openEditForm = (teacher) => {
    setEditingTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      await deleteTeacher(id);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTeacher(null);
    fetchTeachers();
  };

  return (
    <div className="student-list-page">
      <div className="page-header">
        <h1 className="page-title">Teachers</h1>
        <Button variant="primary" onClick={openAddForm}>
          <Plus size={18} /> Add Teacher
        </Button>
      </div>

      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search by name or department..." 
        />
        
        <input 
          type="text" 
          name="department" 
          value={filters.department} 
          onChange={handleFilterChange} 
          placeholder="Filter by Department..."
          className="filter-select"
          style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card table-container">
        {loading ? (
          <div className="loading">Loading teachers...</div>
        ) : teachers.length === 0 ? (
          <div className="empty-state">No teachers found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(teacher => (
                <tr key={teacher._id}>
                  <td>
                    <div className="user-cell">
                      {teacher.avatarUrl ? (
                        <img src={teacher.avatarUrl} alt="" className="table-avatar" />
                      ) : (
                        <div className="table-avatar-placeholder">{teacher.name.charAt(0)}</div>
                      )}
                      <span>{teacher.name}</span>
                    </div>
                  </td>
                  <td>{teacher.email}</td>
                  <td>{teacher.department || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn edit-btn" onClick={() => openEditForm(teacher)}>
                        <Edit size={18} />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(teacher._id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination 
        currentPage={pagination.page} 
        totalPages={pagination.totalPages} 
        onPageChange={handlePageChange} 
      />

      <Modal 
        isOpen={isFormOpen} 
        onClose={closeForm} 
        title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
      >
        <TeacherForm 
          teacher={editingTeacher} 
          onSuccess={closeForm} 
          onCancel={closeForm} 
        />
      </Modal>
    </div>
  );
};

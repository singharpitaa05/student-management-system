import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import { useStudentStore } from '../../stores/useStudentStore.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useExport } from '../../hooks/useExport.js';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { StudentForm } from './StudentForm.jsx';
import './Student.css';

export const StudentList = () => {
  const { students, pagination, loading, error, filters, setFilters, fetchStudents, deleteStudent } = useStudentStore();
  
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  const { downloadFile, exporting } = useExport();

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, filters.search, setFilters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]); // fetch on mount

  const handlePageChange = (newPage) => {
    setFilters({ page: newPage });
  };

  const handleFilterChange = (e) => {
    setFilters({ [e.target.name]: e.target.value, page: 1 });
  };

  const openAddForm = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const openEditForm = (student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteStudent(id);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
    fetchStudents();
  };

  return (
    <div className="student-list-page">
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => downloadFile('/students/export/excel', 'students.xlsx')} disabled={exporting}>
            <Download size={18} /> {exporting ? 'Exporting...' : 'Excel'}
          </Button>
          <Button variant="secondary" onClick={() => downloadFile('/students/export/pdf', 'students.pdf')} disabled={exporting}>
            <Download size={18} /> {exporting ? 'Exporting...' : 'PDF'}
          </Button>
          <Button variant="primary" onClick={openAddForm}>
            <Plus size={18} /> Add Student
          </Button>
        </div>
      </div>

      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search by name or roll number..." 
        />
        
        <select name="feeStatus" value={filters.feeStatus} onChange={handleFilterChange} className="filter-select">
          <option value="">All Fee Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card table-container">
        {loading ? (
          <div className="loading">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="empty-state">No students found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Name</th>
                <th>Email</th>
                <th>Batch</th>
                <th>Fee Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student._id}>
                  <td>{student.rollNumber || '-'}</td>
                  <td>
                    <div className="user-cell">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt="" className="table-avatar" />
                      ) : (
                        <div className="table-avatar-placeholder">{student.name.charAt(0)}</div>
                      )}
                      <span>{student.name}</span>
                    </div>
                  </td>
                  <td>{student.email}</td>
                  <td>{student.batch || '-'}</td>
                  <td>
                    <span className={`status-badge status-${student.feeStatus || 'pending'}`}>
                      {student.feeStatus || 'pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn edit-btn" onClick={() => openEditForm(student)}>
                        <Edit size={18} />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(student._id)}>
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
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      >
        <StudentForm 
          student={editingStudent} 
          onSuccess={closeForm} 
          onCancel={closeForm} 
        />
      </Modal>
    </div>
  );
};

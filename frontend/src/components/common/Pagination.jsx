import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Common.css';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button 
        className="page-btn" 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        <ChevronLeft size={18} />
      </button>
      
      <span className="page-info">
        Page {currentPage} of {totalPages}
      </span>
      
      <button 
        className="page-btn" 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

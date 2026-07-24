import { Search } from 'lucide-react';
import './Common.css';

export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="search-bar">
      <Search className="search-icon" size={18} />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

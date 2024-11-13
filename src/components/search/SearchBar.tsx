import React from 'react';
import { IoCloseCircle } from "react-icons/io5";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, id }) => {
  const handleClear = () => {
    // Create a synthetic event to clear the search
    const event = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    onSearchChange(event);
  };

  return (
    <div className="mb-3">
      <div className="position-relative">
        <input
          type="text"
          id={id}
          className="form-control"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={onSearchChange}
          aria-label="Search applications"
        />
        {searchTerm && (
          <button
            className="btn btn-link position-absolute top-50 end-0 translate-middle-y border-0 p-0 pe-2"
            onClick={handleClear}
            aria-label="Clear search"
            style={{ color: '#6c757d' }}
          >
            <IoCloseCircle size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar; 
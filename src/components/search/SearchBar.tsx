import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, id }) => {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        Search Applications
      </label>
      <input
        type="text"
        id={id}
        className="form-control"
        placeholder="Search applications..."
        value={searchTerm}
        onChange={onSearchChange}
        aria-label="Search applications"
      />
    </div>
  );
};

export default SearchBar; 
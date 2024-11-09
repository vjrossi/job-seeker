import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="mb-3">
      <input
        type="text"
        className="form-control"
        placeholder="Search applications..."
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
  );
};

export default SearchBar; 
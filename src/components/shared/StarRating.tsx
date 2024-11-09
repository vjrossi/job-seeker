import React from 'react';
import './StarRating.css';

interface StarRatingProps {
  rating: number;
  onRatingChange: (newRating: number) => void;
  size?: 'small' | 'medium' | 'large';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange,
  size = 'medium'
}) => {
  return (
    <div className={`star-rating ${size}`} onClick={(e) => e.stopPropagation()}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : 'empty'}`}
          onClick={() => onRatingChange(star)}
          role="button"
          aria-label={`Rate ${star} stars`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating; 
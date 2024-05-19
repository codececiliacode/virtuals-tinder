import React from 'react';

interface User {
    id: number;
    name: string;
    university: string;
    location: number;
    interests: string;
}

interface UserCardProps {
  user: User | null; // Update the type declaration to allow null
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
    
    if (!user) {
    return <div>No user data available</div>; // Handle case when user is null
    }

    return (
        <div className="user-card">
            <h3>{user.name}</h3>
            <p><strong>University:</strong> {user.university}</p>
            <p>{user.location}km away</p>
            <p><strong>Interests:</strong> {user.interests}</p>
        </div>
    );
};

export default UserCard;

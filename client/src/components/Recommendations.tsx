import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserCard from './UserCard';

type primarykey = number | string;

interface User {
    id: number;
    name: string;
    university: string;
    location: number;
    interests: string;
}
interface UserIdProps {
  userId: primarykey | null; // Update the type declaration to allow null
}

const Recommendations: React.FC<UserIdProps> = ({userId}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await axios.get<User[]>(`/api/recommendations/${userId}`);
                setUsers(response.data);
                console.log(response.data)
                setLoading(false);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [userId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="recommendations-container">
            {users.map(user => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
};

export default Recommendations;

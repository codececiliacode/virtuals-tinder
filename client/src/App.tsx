import React, { useEffect, useState } from 'react';
import Recommendations from './components/Recommendations';
import './App.css';
import UserCard from './components/UserCard';
import axios from 'axios';

interface User {
    id: number;
    name: string,
    university: string;
    location: number;
    interests: string;
}
type primarykey = number | string;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<primarykey | null>(null);

   useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get<User>(`/api/user/${userId}`);
        setUser(response.data); // Set user state to response data
        console.log(response.data)
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setLoading(false);
      }
    };

    if (userId !== null) {
      fetchRecommendations(); // Call fetchRecommendations only if userId is not null
    }
  }, [userId]); 


    return (
        <div className="App">
            <h2 className='align-left'>Your Profile:</h2>
            <UserCard user={user}/>
                      <label htmlFor="userId">User ID: </label>
           <input name='userId' type="number" placeholder='User ID' onChange={(e) => setUserId(e.target.value)} />

            <h4 className='align-left'>Recommendations</h4>
            <Recommendations userId={userId}/>
        </div>
    );
};

export default App;

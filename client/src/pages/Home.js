import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/api/data') // Assuming your backend API endpoint is '/api/data'
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div>
      {data ? <p>{data}</p> : <p>Loading...</p>}
    </div>
  );
};

export default Home;

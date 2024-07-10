import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import config from '../config/config.json';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const Backend_ip = config.Backend_ip;

function KeywordAPI() {
    const [keywords, setKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                const response = await axios.get(`${Backend_ip}/api/paper/keywordExtract`);
                setKeywords(response.data.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
        fetchKeywords();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            <h2>Keywords</h2>
            <ul>
                {Object.entries(keywords).map(([keyword, score]) => (
                    <li key={keyword}>{keyword}: {score}</li>
                ))}
            </ul>
        </div>
    );
}


function ToggleButtons() {
    const [alignment, setAlignment] = React.useState('selected');
    
    const handleAlignment = (event, newAlignment) => {
      if (newAlignment !== null) {
        setAlignment(newAlignment);
      }
    };
  
    return (
      <ToggleButtonGroup
        value={alignment}
        exclusive
        onChange={handleAlignment}
        aria-label="Platform"
      >
        <ToggleButton value="Summary">summary</ToggleButton>
        <ToggleButton value="Summary">summary</ToggleButton>

      </ToggleButtonGroup>
    );
  }


function Keyword() {
    return (
        <div>
            <h1>preview</h1>
            <ToggleButtons />
            <KeywordAPI />
        </div>
    )
}

export default Keyword;
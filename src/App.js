import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [query, setQuery] = useState('');
  const [choices, setChoices] = useState([]);
  const [inputType, setInputType] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [freeTextResponse, setFreeTextResponse] = useState('');

  // Function to send the user's input and choice to the server
  const fetchNextQuery = async (userInput, userChoice = null) => {
    try {
      const response = await axios.post('http://localhost:3001/api/fetch-next-query', {
        userInput,
        userChoice,
        conversationHistory,
      });

      const data = response.data;

      setQuery(data.query);
      setChoices(data.choices);
      setInputType(data.type);
      setSelectedChoices([]);  // Reset selected choices for the next round
      setFreeTextResponse('');  // Reset free text response for the next round
      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', content: userChoice ? `${userInput}: ${userChoice}` : userInput },
        { role: 'assistant', content: data.query }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Handles the initial query submission
  const handleSubmit = (event) => {
    event.preventDefault();
    fetchNextQuery(prompt);
    setPrompt('');
  };

  // Handles selection submission
  const handleSelectionSubmit = () => {
    if (inputType === 'free-text') {
      fetchNextQuery(query, freeTextResponse);
    } else {
      fetchNextQuery(query, selectedChoices.join(', '));
    }
  };

  // Handles individual selection changes
  const handleSelectionChange = (event) => {
    const value = event.target.value;

    if (inputType === 'single') {
      setSelectedChoices([value]);
    } else if (inputType === 'multiple') {
      if (selectedChoices.includes(value)) {
        setSelectedChoices(selectedChoices.filter(choice => choice !== value));
      } else {
        setSelectedChoices([...selectedChoices, value]);
      }
    }
  };

  // Handles free text input change
  const handleFreeTextChange = (event) => {
    setFreeTextResponse(event.target.value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Shopping Assistant</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What are you looking for?"
          style={{ width: '300px', marginRight: '10px' }}
        />
        <button type="submit">Submit</button>
      </form>

      {query && (
        <div style={{ marginTop: '20px' }}>
          <h2>{query}</h2>
          {inputType === 'single' && (
            <div>
              {choices.map((choice, index) => (
                <div key={index}>
                  <input
                    type="radio"
                    id={`choice-${index}`}
                    name="single-choice"
                    value={choice}
                    checked={selectedChoices.includes(choice)}
                    onChange={handleSelectionChange}
                  />
                  <label htmlFor={`choice-${index}`}>{choice}</label>
                </div>
              ))}
            </div>
          )}

          {inputType === 'multiple' && (
            <div>
              {choices.map((choice, index) => (
                <div key={index}>
                  <input
                    type="checkbox"
                    id={`choice-${index}`}
                    name="multiple-choice"
                    value={choice}
                    checked={selectedChoices.includes(choice)}
                    onChange={handleSelectionChange}
                  />
                  <label htmlFor={`choice-${index}`}>{choice}</label>
                </div>
              ))}
            </div>
          )}

          {inputType === 'free-text' && (
            <div>
              <textarea
                placeholder="Type your answer here"
                rows="4"
                cols="50"
                value={freeTextResponse}
                onChange={handleFreeTextChange}
              />
            </div>
          )}

          <button onClick={handleSelectionSubmit} style={{ marginTop: '20px' }}>
            Submit Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

ReactDOM.render(<App />, document.getElementById('root'));

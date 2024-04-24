// App.js
import React, { useState } from 'react';
import GraphCreator from './GraphCreator';
import './App.css';

const App = () => {
  const [graphCreators, setGraphCreators] = useState([]);

  const addGraphCreator = () => {
    setGraphCreators([...graphCreators, graphCreators.length]);
  };

  const removeGraphCreator = (id) => {
    setGraphCreators(graphCreators.filter(gcId => gcId !== id));
  };

  return (
    <div className="app-container">
        {graphCreators.map((gcId) => (
            <GraphCreator key={gcId} id={gcId} onRemove={removeGraphCreator} />
        ))}
      <div>
        <button className="add-graph-button" onClick={addGraphCreator}>Добавить график для региона</button>
        <button className="add-graph-button" onClick={addGraphCreator}>Добавить график для категории</button>
      </div>
    </div>
  );
};

export default App;

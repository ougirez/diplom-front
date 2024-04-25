// App.js
import React, { useState } from 'react';
import GraphCreator from './GraphCreator';
import './App.css';

const App = () => {
  const [graphCreators, setGraphCreators] = useState([]);

  const addRegionGraphCreator = () => {
    setGraphCreators([...graphCreators, {id: graphCreators.length, type: "region"}]);
  };

  const addCategoryGraphCreator = () => {
    setGraphCreators([...graphCreators, {id: graphCreators.length, type: "category"}]);
  };

  const removeGraphCreator = (id) => {
    setGraphCreators(graphCreators.filter(graph => graph.id !== id));
  };

  return (
    <div className="app-container">
        {graphCreators.map(graph => (
            <GraphCreator key={graph.id} id={graph.id} graphType={graph.type} onRemove={removeGraphCreator} />
        ))}
      <div>
        <button className="add-graph-button" onClick={addRegionGraphCreator}>Добавить график для региона</button>
        <button className="add-graph-button" onClick={addCategoryGraphCreator}>Добавить график для категории</button>
      </div>
    </div>
  );
};

export default App;

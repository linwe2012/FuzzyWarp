import React from 'react';
import './App.css';
import Render from './render';

const App: React.FC = () => {
  
  return (
    <div className="App">
      <div className="canvas" id="canvas-frame" style={{
        width: 400,
        height: 400
      }}>
        <Render>

        </Render>
      </div>
      
    </div>
  );
}

export default App;

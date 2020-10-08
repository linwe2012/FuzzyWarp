import React from 'react';
import './App.css';
import Render from './render';

const App: React.FC = () => {
  
  return (
    <div className="App" style={{display:'flex'}}>
      <div className="canvas" id="canvas-frame" style={{
        width: 800,
        height: 600
      }}>
        <Render>

        </Render>
      </div>
      <div style={{marginLeft: 10, textAlign: 'left'}}>
      <p>Usage: </p>
      <li> Click on gray area to make 1st shape </li>
      <li> Click toggle to make 2nd shape, <em>Make sure 2nd shape has more vertices than first one</em> </li>
      <li> Click tranform to see the transform </li>

      <li> refresh page to try new transfroms </li>
      </div>
    </div>
  );
}

export default App;

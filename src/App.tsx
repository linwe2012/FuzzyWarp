import React, {useState} from 'react';
import './App.css';
import Render, { RenderSettings } from './render';

import PersonalPage from './personal_page'

const App: React.FC = () => {
  const [handle, setHandle] = useState<any>(undefined)
  
  return (
    <div className="App" style={{display:'flex'}}>
      <div className="canvas" id="canvas-frame" style={{
        width: 800,
        height: 600
      }}>
        <Render onHandle={(h)=>setHandle(h)}>

        </Render>
      </div>
      <div style={{marginLeft: 10, textAlign: 'left'}}>
      <a href='https://github.com/linwe2012/FuzzyWarp'>Github Source Code</a> <span> &nbsp; &nbsp; </span>
      <a href='https://ieeexplore.ieee.org/abstract/document/511850'>Paper on IEEE</a> <br/>
      <a href='https://github.com/linwe2012/FuzzyWarp/blob/master/docs/FuzzyApproach.pdf'>[PDF] A fuzzy approach to digital image warping</a>
      <h3>Usage: </h3>
      <li> Click on the gray area to make 1st shape </li>
      <li> Click toggle button, then you can make 2nd shape </li>
      <li> Click tranform to see the animation </li>

      <li> refresh page to try new transfroms </li>

      <div className='seperator'></div>
      <h3>Parameters: </h3>
      <RenderSettings handle={handle}></RenderSettings>
      <div className='seperator'></div>
      <h3> Note: </h3>
      <li> The 3 dots, blue, green, red indicates the reference points, This can be changed via Fuzzy polygon similarity. </li>
      <p></p>
      <PersonalPage/>
      </div>
    </div>
  );
}

export default App;

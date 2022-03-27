import React, { useState } from 'react';
import { RgbaColorPicker } from 'react-colorful';

type color = {
  r: number,
  g: number,
  b: number,
  a: number,
}


/*
* This is meant for testing with the backend node server at: https://github.com/Brandons404/god-rays-backend to send RGB values to a python script
* to use it, download the repo and follow the instructions in the Readme, then include this component on a page somewhere
*
*/

const ColorPicker = () => {
  const [color, setColor] = useState<color>({ r: 200, g: 150, b: 35, a: 0.5 });

  const { r, g, b} = color;

  const handleClick = async() => {
    const body = color;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({r, g, b}),
    };

    try {
      const response = await fetch('http://localhost:5000/api/color', options)
      const data = await response.json();
      console.log(data)

    } catch (e) {
      console.error(e)
    }
  }
  
  
  return (
    <div style={{width: '20%', height: '400px', paddingTop: "1px", borderRadius: "4px", margin: "5% auto", boxShadow: '5px 10px 18px rgb(80, 80, 80)'}}>
      <RgbaColorPicker style={{margin: "15% auto 10% auto"}} color={color} onChange={setColor} />

      <div style={{ width: "100%", margin: "auto"}}>
      <div 
      id="send"
      onClick={handleClick}
      >
        
        <h3 style={{margin: 'auto 0 auto 0'}} >Send rgb({r}, {g}, {b})</h3>

      <div style={{
        width: '35px',
        height: '35px',
        backgroundColor: `rgb(${r}, ${g}, ${b})`,
        margin: "auto 0 auto 15px",
        borderRadius: "5px",
        border: "2px solid rgb(50, 50, 50)"
        }}/>
    </div>


      </div>
    </div>
  );
};

export default ColorPicker;

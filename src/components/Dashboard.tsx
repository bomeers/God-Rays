import React, { useState } from 'react';
import { RgbaColorPicker } from 'react-colorful';

type color = {
  r: number,
  g: number,
  b: number,
  a: number,
}

const Dashboard = () => {
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
    <>
      <RgbaColorPicker style={{margin: "5% auto"}} color={color} onChange={setColor} />
      <div style={{ width: "100%"}}>
      <div 
      id="send"
      onClick={handleClick}
      >
        
        <h2>Send rgb({r}, {g}, {b})</h2>

      <div style={{
        width: '50px',
        height: '50px',
        backgroundColor: `rgb(${r}, ${g}, ${b})`,
        margin: "auto 0 auto 15px",
        borderRadius: "5px",
        border: "2px solid rgb(50, 50, 50)"
        }}/>
    </div>


      </div>
    </>
  );
};

export default Dashboard;

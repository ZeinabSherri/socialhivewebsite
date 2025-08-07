import React from 'react';
import honeyGif from '../assets/gifs/honeydrip.gif';


const DrippingHoney: React.FC = () => (
  <div
    className="absolute inset-x-0 top-0 w-full pointer-events-none overflow-hidden z-20"
    style={{ height: '220px', mixBlendMode: 'normal' }}
  >
    <img
      src={honeyGif}
      alt="Honey drip"
      className="w-full h-auto object-top"
    />
  </div>
)

export default DrippingHoney
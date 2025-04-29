import React from 'react';
import MediaCanvas from './MediaCanvas';
import NewsTicker  from './NewsTicker';

export default function App() {
  return (
    <>
      <div className="h-full">
        <NewsTicker />   {/* overlay bar */}
        <MediaCanvas />  {/* your existing canvas */}
      </div>
    </>
  );
}


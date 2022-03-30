import React from "react";
const App = () => {
  return (
    <div>
      <button onClick={() => Promise.reject()}>Promise.reject</button>
      <button onClick={() => console.error("error")}>console.error</button>
    </div>
  );
};

export default App;

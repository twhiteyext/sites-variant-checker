import * as React from "react";

function MyForm() {
  const [text, setText] = React.useState("");

  return (
    <>
      <label>Enter your name:
        <input
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button>
        Search
      </button>
    </>
  )
}
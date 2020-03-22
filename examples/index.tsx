import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import TodoList from "./TodoList";

function App() {
	return (
		<div className="main">
			<TodoList />
			<TodoList />
		</div>
	);
}

ReactDOM.render(<App />, document.getElementById("root"));

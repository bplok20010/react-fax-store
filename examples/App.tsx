import React from "react";
import Page1 from "./Page1";
import map from "lodash/map";

import Context from "./Context";

import GlobalContext from "./GlobalContext";

var s = [1, 2, 3, 4, 5];

map(s, v => {
	return { a: v };
});

console.log(Context);

function RFC() {
	return <>12</>;
}

function Action() {
	const [state, setState] = [GlobalContext.useState(), GlobalContext.useUpdate()];

	console.log("Action...");
	return (
		<div className="main">
			<RFC />
			<button
				onClick={() => {
					console.log("re-render");
					setState({
						counter: state.age % 5 < 4 ? 999 : 1,
						age: state.age + 1,
					});
					console.log("re-render end");
				}}
			>
				Add
			</button>
		</div>
	);
}

function Display() {
	const state = GlobalContext.useState();
	return <h2>{JSON.stringify(state)}</h2>;
}

function Counter() {
	const selector = state => {
		return {
			counter: state.counter,
		};
	};
	const state = GlobalContext.useSelector(state => {
		return {
			s: 1,
			counter: state.counter,
		};
	});

	console.log("counter...");

	return <h2>counter: {state.counter}</h2>;
}

class Test1 extends React.Component {
	componentDidMount() {
		console.log("Test1 componentDidMount");
	}
	componentDidUpdate() {
		console.log("Test1 componentDidUpdate");
	}
	render() {
		return (
			<>
				<Test2 />
			</>
		);
	}
}

class Test2 extends React.Component {
	static contextType = Context;

	componentDidMount() {
		console.log("Test2 componentDidMount");
	}
	componentDidUpdate() {
		console.log("Test2 componentDidUpdate");
	}
	render() {
		return <Display />;
	}
}

function Wrapper() {
	console.log(GlobalContext.useState());
	return (
		<>
			<Action />
			<Test1 />
			<Counter />
		</>
	);
}

export default class App extends React.Component {
	static contextType = Context;

	componentDidMount() {
		// setInterval(() => {
		// 	this.setState({});
		// }, 1000);
		console.log("App componentDidMount");
	}

	componentDidUpdate() {
		console.log("App componentDidUpdate");
	}

	render() {
		return (
			<GlobalContext.Provider>
				<Page1>
					<Wrapper></Wrapper>
				</Page1>
			</GlobalContext.Provider>
		);
	}
}

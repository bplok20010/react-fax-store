import { mount, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { createStore, createReducer, Provider } from "../src";
import React from "react";

configure({ adapter: new Adapter() });

test("createStore", () => {
	const context = createStore(() => ({}));

	expect(Object.keys(context)).toHaveLength(8);

	expect(Object.keys(context)).toEqual([
		"Context",
		"Provider",
		"Consumer",
		"useProvider",
		"useStore",
		"useState",
		"useSelector",
		"useUpdate",
	]);
});

test("render Provider -1", () => {
	const data = {
		name: "provider",
	};
	const Context = createStore(() => data);

	const ref = React.createRef<Provider<typeof data>>();

	mount(<Context.Provider ref={ref} />);

	expect(ref.current.state).toEqual({ name: "provider" });
});

test("render Provider with child update", () => {
	const data = {
		name: "provider",
	};
	const Context = createStore(() => data);

	const ref = React.createRef<RootComponent>();

	let counter = 0;

	class MyComponent extends React.Component {
		componentDidMount() {
			counter++;
		}
		componentDidUpdate() {
			this.componentDidMount();
		}
		render() {
			return null;
		}
	}

	class RootComponent extends React.Component {
		render() {
			return (
				<Context.Provider>
					<MyComponent />
				</Context.Provider>
			);
		}
	}

	mount(<RootComponent ref={ref} />);

	ref.current.setState({}, () => {
		expect(counter).toEqual(2);
	});
});

test("render Provider without child update", () => {
	const data = {
		name: "provider",
	};

	const ref = React.createRef<Provider<typeof data>>();

	const Context = createStore(() => data);

	let counter = 0;

	class MyComponent extends React.Component {
		componentDidMount() {
			counter++;
		}
		componentDidUpdate() {
			this.componentDidMount();
		}
		render() {
			return null;
		}
	}

	class RootComponent extends React.Component {
		providerRef = React.createRef<Provider<typeof data>>();

		componentDidMount() {}
		render() {
			return (
				<Context.Provider ref={ref}>
					<MyComponent />
				</Context.Provider>
			);
		}
	}

	mount(<RootComponent />);

	ref.current.setState({ name: "update" }, () => {
		expect([counter, ref.current.state]).toEqual([1, { name: "update" }]);
	});
});

test("Provider with initialValue ", () => {
	const data = {
		name: "provider",
	};

	const Context = createStore(() => data);

	function MyComponent() {
		const state = Context.useState();
		return <div>{state.name}</div>;
	}

	class RootComponent extends React.Component {
		render() {
			return (
				<Context.Provider
					initialValue={{
						name: "initialValue",
					}}
				>
					<MyComponent />
				</Context.Provider>
			);
		}
	}

	const wrapper = mount(<RootComponent />);

	expect(wrapper.text()).toEqual("initialValue");
});

test("useState&useUpdate", () => {
	const data = {
		v: 1,
		counter: 10,
		value: "a",
	};

	let counter = 0;

	const Context = createStore(() => data);

	function Button() {
		counter++;
		const update = Context.useUpdate();
		return (
			<>
				<button
					className="value-btn"
					onClick={() => {
						update({
							value: "b",
						});
					}}
				>
					Count
				</button>
				<button
					className="counter-btn"
					onClick={() => {
						update(prevState => {
							return {
								counter: prevState.counter + 10,
							};
						});
					}}
				>
					Count
				</button>
			</>
		);
	}

	function Consumer() {
		const state = Context.useState();
		return (
			<>
				<div className="consumer">{state.value}</div>
				<div className="consumer2">{state.counter}</div>
			</>
		);
	}

	class MyComponent extends React.Component {
		componentDidMount() {
			counter++;
		}
		componentDidUpdate() {
			this.componentDidMount();
		}
		render() {
			return <Consumer />;
		}
	}

	class Action extends React.Component {
		render() {
			return (
				<div>
					<Button />
				</div>
			);
		}
	}

	class RootComponent extends React.Component {
		render() {
			return (
				<Context.Provider>
					<Action />
					<MyComponent />
				</Context.Provider>
			);
		}
	}

	const wrapper = mount(<RootComponent />);

	expect(counter).toEqual(2);
	expect(wrapper.find(".consumer").text()).toEqual("a");

	wrapper.find(".value-btn").simulate("click");

	expect(counter).toEqual(2);
	expect(wrapper.find(".consumer2").text()).toEqual("10");
	expect(wrapper.find(".consumer").text()).toEqual("b");

	wrapper.find(".counter-btn").simulate("click");
	expect(wrapper.find(".consumer2").text()).toEqual("20");
	expect(wrapper.find(".consumer").text()).toEqual("b");
});

test("createReducer", () => {
	const ReducerStore = createReducer(
		(prevState, action) => {
			switch (action.type) {
				case "increment":
					return {
						counter: prevState.counter + action.data,
					};
				case "decrement":
					return {
						counter: prevState.counter - action.data,
					};
				default:
					// throw new Error("unknown type");
					return prevState;
			}
		},
		() => ({
			counter: 100,
		})
	);

	function Display() {
		const state = ReducerStore.useState();
		return <div className="counter">{state.counter}</div>;
	}

	function Increment() {
		const dispatch = ReducerStore.useDispatch();
		return (
			<button
				className="increment"
				onClick={() =>
					dispatch({
						type: "increment",
						data: 1,
					})
				}
			>
				increment
			</button>
		);
	}

	function Decrement() {
		const dispatch = ReducerStore.useDispatch();
		return (
			<button
				className="decrement"
				onClick={() =>
					dispatch({
						type: "decrement",
						data: 1,
					})
				}
			>
				decrement
			</button>
		);
	}

	function ErrorAction() {
		const dispatch = ReducerStore.useDispatch();
		return (
			<button
				className="error"
				onClick={() =>
					dispatch({
						type: "error",
						data: 1,
					})
				}
			>
				error
			</button>
		);
	}

	const wrapper = mount(
		<ReducerStore.Provider>
			<div>
				<Increment />
				<Decrement />
				<ErrorAction />
				<Display />
			</div>
		</ReducerStore.Provider>
	);

	expect(wrapper.find(".counter").text()).toEqual("100");

	wrapper.find(".increment").simulate("click");
	expect(wrapper.find(".counter").text()).toEqual("101");
	wrapper.find(".decrement").simulate("click");
	expect(wrapper.find(".counter").text()).toEqual("100");
	wrapper.find(".decrement").simulate("click");
	expect(wrapper.find(".counter").text()).toEqual("99");

	wrapper.find(".error").simulate("click");
	expect(wrapper.find(".counter").text()).toEqual("99");
});

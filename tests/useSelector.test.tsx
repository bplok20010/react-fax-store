import { mount, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { createStore, Provider } from "../src";
import React from "react";

configure({ adapter: new Adapter() });

test("useSelector basic", () => {
	const data = {
		value: "react",
		name: "pure",
		address: "context",
	};

	const ref = React.createRef<Provider<typeof data>>();

	let ButtonCallCounter = 0;
	let MyComponentCallCounter = 0;
	let ConsumerCallCounter = 0;
	let Consumer1CallCounter = 0;
	let Consumer2CallCounter = 0;
	let Consumer3CallCounter = 0;
	let UseReactContextCallCounter = 0;

	let idx = 0;

	const Store = createStore(() => ({
		...data,
	}));

	function Button() {
		ButtonCallCounter++;
		const update = Store.useUpdate();
		return (
			<button
				onClick={() => {
					idx++;
					update({
						value: "react" + idx,
						name: "pure" + idx,
					});
				}}
			>
				Count
			</button>
		);
	}

	function Consumer() {
		ConsumerCallCounter++;

		const state = Store.useState();
		return (
			<div className="consumer">
				{state.value}-{state.name}-{state.address}
			</div>
		);
	}
	function Consumer1() {
		Consumer1CallCounter++;

		const value = Store.useSelector(state => state.value);
		return <div className="consumer1">{value}</div>;
	}
	function Consumer2() {
		Consumer2CallCounter++;

		const name = Store.useSelector(state => state.name);
		return <div className="consumer2">{name}</div>;
	}
	function Consumer3() {
		Consumer3CallCounter++;
		const address = Store.useSelector(state => state.address);
		return <div className="consumer3">{address}</div>;
	}

	function UseReactContext() {
		UseReactContextCallCounter++;
		const state = React.useContext(Store.Context);
		return (
			<div className="use-react-context">
				{state.value}-{state.name}-{state.address}
			</div>
		);
	}

	class MyComponent extends React.Component {
		componentDidMount() {
			MyComponentCallCounter++;
		}
		componentDidUpdate() {
			this.componentDidMount();
		}
		render() {
			return (
				<>
					<Consumer />
					<Consumer1 />
					<Consumer2 />
					<Consumer3 />
					<UseReactContext />
				</>
			);
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

	let ReRenderCallCounter = 0;
	function Test1() {
		ReRenderCallCounter++;
		Store.useState();
		return null;
	}
	function Test() {
		Store.useState();
		return <Test1 />;
	}

	class RootComponent extends React.Component {
		render() {
			return (
				<Store.Provider ref={ref}>
					<Action />
					<MyComponent />
					<Store.Consumer>
						{state => {
							return (
								<>
									{idx > 2 ? null : <Test />}
									<div className="consumer-fc">
										{state.value}-{state.name}-{state.address}
									</div>
								</>
							);
						}}
					</Store.Consumer>
				</Store.Provider>
			);
		}
	}

	const wrapper = mount(<RootComponent />);

	expect(wrapper.find(".use-react-context").text()).toEqual("react-pure-context");
	expect(wrapper.find(".consumer").text()).toEqual("react-pure-context");
	expect(wrapper.find(".consumer-fc").text()).toEqual("react-pure-context");
	expect(wrapper.find(".consumer1").text()).toEqual("react");
	expect(wrapper.find(".consumer2").text()).toEqual("pure");
	expect(wrapper.find(".consumer3").text()).toEqual("context");

	wrapper.find("button").simulate("click");

	expect(ButtonCallCounter).toEqual(1);
	expect(MyComponentCallCounter).toEqual(1);
	expect(UseReactContextCallCounter).toEqual(2);
	expect(ConsumerCallCounter).toEqual(2);
	expect(Consumer1CallCounter).toEqual(2);
	expect(Consumer2CallCounter).toEqual(2);
	expect(Consumer3CallCounter).toEqual(1);

	expect(wrapper.find(".use-react-context").text()).toEqual("react1-pure1-context");
	expect(wrapper.find(".consumer").text()).toEqual("react1-pure1-context");
	expect(wrapper.find(".consumer-fc").text()).toEqual("react1-pure1-context");
	expect(wrapper.find(".consumer1").text()).toEqual("react1");
	expect(wrapper.find(".consumer2").text()).toEqual("pure1");
	expect(wrapper.find(".consumer3").text()).toEqual("context");

	wrapper.find("button").simulate("click");

	expect(ButtonCallCounter).toEqual(1);
	expect(MyComponentCallCounter).toEqual(1);
	expect(UseReactContextCallCounter).toEqual(3);
	expect(ConsumerCallCounter).toEqual(3);
	expect(Consumer1CallCounter).toEqual(3);
	expect(Consumer2CallCounter).toEqual(3);
	expect(Consumer3CallCounter).toEqual(1);

	expect(wrapper.find(".use-react-context").text()).toEqual("react2-pure2-context");
	expect(wrapper.find(".consumer").text()).toEqual("react2-pure2-context");
	expect(wrapper.find(".consumer-fc").text()).toEqual("react2-pure2-context");
	expect(wrapper.find(".consumer1").text()).toEqual("react2");
	expect(wrapper.find(".consumer2").text()).toEqual("pure2");
	expect(wrapper.find(".consumer3").text()).toEqual("context");

	expect(ReRenderCallCounter).toEqual(3);

	expect(ref.current.getSubscribeCount()).toEqual(7);

	wrapper.find("button").simulate("click");

	expect(ref.current.getSubscribeCount()).toEqual(5);
});

import React from "react";

import TodoStore from "./TodoStore";

function List() {
	const update = TodoStore.useUpdate();
	const items = [...TodoStore.useSelector(state => state.items)];

	return (
		<>
			{items.length ? null : <div className="item">no data.</div>}
			{items.map((item, i) => {
				return (
					<div key={i} className="item">
						<div className="title">{item.title}</div>
						<div className="desc">{item.desc}</div>
						<div
							className="remove"
							onClick={() => {
								items.splice(i, 1);
								update({
									items,
								});
							}}
						>
							Remove
						</div>
					</div>
				);
			})}
		</>
	);
}

function AddBtn() {
	const update = TodoStore.useUpdate();
	return (
		<>
			<button
				onClick={() =>
					update(prevState => {
						return {
							items: [
								...prevState.items,
								{
									title: "demo_" + Date.now(),
									desc: "test",
								},
							],
						};
					})
				}
			>
				Add
			</button>
		</>
	);
}

function Total() {
	const state = TodoStore.useState();

	return <div className="total">{state.items.length} total</div>;
}

function RenderCounter(props) {
	let [counter, update] = React.useState(0);

	React.useEffect(() => {
		update(counter + 1);
	}, [props]);

	return <>{counter}</>;
}

class TodoList extends React.Component {
	render() {
		return (
			<div className="todo-list">
				<TodoStore.Provider>
					<AddBtn></AddBtn>
					<button onClick={() => this.forceUpdate()}>Refresh</button> <RenderCounter />
					<Total />
					<List />
				</TodoStore.Provider>
			</div>
		);
	}
}
export default TodoList;

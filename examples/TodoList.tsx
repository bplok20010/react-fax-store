import React from "react";
import { withHooks } from "../src";

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

function AddBtn(props) {
	const store = TodoStore.useProvider();
	return (
		<div>
			<button onClick={() => props.handleAdd(store)}>Add</button>
		</div>
	);
}

function Total() {
	const state = TodoStore.useState();

	return <div className="total">totals: {state.items.length}</div>;
}

class TodoList extends React.Component {
	handleAdd(store: ReturnType<typeof TodoStore.useProvider>) {
		store.setState({
			items: [
				...store.state.items,
				{
					title: "demo_" + Date.now(),
					desc: "test",
				},
			],
		});
	}

	render() {
		return (
			<div className="todo-list">
				<TodoStore.Provider>
					<AddBtn handleAdd={this.handleAdd.bind(this)}></AddBtn>
					<Total />
					<List />
				</TodoStore.Provider>
			</div>
		);
	}
}
export default TodoList;

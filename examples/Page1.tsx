import React from "react";

import Context from "./Context";

const v = { a: 1 };
export default class Page1 extends React.Component {
	getValue() {
		return {};
	}

	componentDidMount() {
		// setInterval(() => {
		// 	this.setState({});
		// }, 500);
	}

	render() {
		const { children } = this.props;
		return (
			<Context.Provider value={this.getValue()}>
				<div>{children}</div>
			</Context.Provider>
		);
	}
}

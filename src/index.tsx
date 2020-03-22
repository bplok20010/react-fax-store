import React from "react";
import withComponentHooks from "with-component-hooks";
import shallowEqual from "./shallowEqual";

export type Update<T = {}> = <K extends keyof T>(state: Pick<T, K> | T | null) => void;
export type Subscriber<T = {}> = (prevState: Readonly<T>, nextState: Readonly<T>) => void;
export type UseSelector<T = {}> = <S extends (state: T) => any>(selector: S) => ReturnType<S>;
export type UseUpdate<T = {}> = () => Update<T>;
export type UseState<T = {}> = () => T;
export type UseProvider<T> = () => Provider<T>;

export interface ConsumerProps<T = {}> {
	children: (state: T) => React.ReactElement | null;
}

export type Consumer<T = {}> = React.FC<ConsumerProps<T>>;

export interface Provider<T = {}> extends React.Component<{}, T> {
	getSubscribeCount(): number;
	subscribe(subscriber: Subscriber<T>): () => void;
}

export interface Context<T = {}> {
	Provider: new (props: {}) => Provider<T>;
	Consumer: Consumer<T>;
	useProvider: UseProvider<T>;
	useState: () => T;
	useSelector: UseSelector<T>;
	useUpdate: UseUpdate<T>;
}

export const withHooks = withComponentHooks as <T extends typeof React.Component>(
	component: T
) => T;

export function createStore<T extends Record<string, any>>(initialValue: T): Context<T> {
	const ReactContext = React.createContext<Provider<T>>({} as Provider<T>);

	const Provider = class extends React.Component<{}, T> {
		protected _listeners: Subscriber<T>[] = [];

		getSubscribeCount() {
			return this._listeners.length;
		}

		state: Readonly<T> = initialValue;

		setState<K extends keyof T>(
			state:
				| ((prevState: Readonly<T>, props: Readonly<{}>) => Pick<T, K> | T | null)
				| (Pick<T, K> | T | null),
			callback?: () => void
		) {
			const prevState = this.state;
			super.setState(state, () => {
				this._listeners.forEach(listener => {
					listener(prevState, this.state);
				});
				callback && callback();
			});
		}

		subscribe(subscriber: Subscriber<T>): () => void {
			this._listeners.push(subscriber);
			return () => {
				const idx = this._listeners.indexOf(subscriber);
				if (idx > -1) {
					this._listeners.splice(idx, 1);
				}
			};
		}

		// no re-render, although current ReactContext.Provider already does not re-render,
		shouldComponentUpdate(nextProps: {}) {
			if (this.props === nextProps) {
				return false;
			}
			return true;
		}

		componentWillUnmount() {
			this._listeners.length = 0;
		}

		render() {
			return (
				<ReactContext.Provider value={this}>{this.props.children}</ReactContext.Provider>
			);
		}
	};

	const Consumer: Consumer<T> = function(props) {
		const [state, setState] = React.useState(initialValue);
		const provider = React.useContext(ReactContext);

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				setState(nextState);
			});
		});

		return props.children(state);
	};

	const useProvider: UseProvider<T> = function() {
		return React.useContext(ReactContext);
	};

	const useState: UseState<T> = function() {
		const [state, setState] = React.useState(initialValue);
		const provider = React.useContext(ReactContext);

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				setState(nextState);
			});
		});

		return state;
	};

	const useSelector: UseSelector<T> = function useSelector(selector) {
		const [state, setState] = React.useState(selector(initialValue));
		const provider = React.useContext(ReactContext);

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				const newState = selector(nextState);
				if (!shallowEqual(state, newState)) {
					setState(newState);
				}
			});
		});

		return state;
	};

	const useUpdate: UseUpdate<T> = function() {
		const provider = React.useContext(ReactContext);

		return state => {
			provider.setState(state);
		};
	};

	return {
		Provider,
		Consumer,
		useProvider,
		useState,
		useSelector,
		useUpdate,
	};
}

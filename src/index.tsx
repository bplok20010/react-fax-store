import React from "react";
import withComponentHooks from "with-component-hooks";
import shallowEqual from "./shallowEqual";

type Update<T> = (state: Partial<T>) => void;
type SelectorReturn<T> = any;
type Selector<T> = (state: T) => SelectorReturn<T>;
type useStateReturn<T> = [T, Update<T>];
type useSelectorReturn<T> = [SelectorReturn<T>, Update<T>];
type Subscriber<T> = (prevState: T, nextState: T) => void;

type UseSelector<T, TResult extends (state: T) => any> = (
	selector: Selector<T>
) => [ReturnType<TResult>, Update<T>];

interface ConsumerProps<T> {
	children: (state: T) => React.ReactNode;
}

interface Provider<T> extends React.Component<{}, T> {
	subscribe(subscriber: Subscriber<T>): () => void;
}

interface Context<T> {
	Provider: new (props: {}) => Provider<T>;
	Consumer: Consumer<T>;
	useState: () => useStateReturn<T>;
	useSelector: UseSelector<T, (state: T) => any>;
	useUpdate: Update<T>;
}

type Consumer<T> = (props: ConsumerProps<T>) => React.ReactNode;

export const withHooks = withComponentHooks as <T extends React.Component>(component: T) => T;

export function createContext<T extends Record<string, any>>(initialValue: T): Context<T> {
	const ReactContext = React.createContext<Provider<T>>({} as Provider<T>);

	const Provider = class extends React.Component<{}, T> {
		protected _listeners: Subscriber<T>[] = [];

		state: T = initialValue;

		setState(state: T, callback?: () => void) {
			const oldState = this.state;
			super.setState(state, () => {
				this._listeners.forEach(listener => {
					listener(oldState, state);
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

	const Consumer: Consumer<T> = function(props: ConsumerProps<T>) {
		const [state, setState] = React.useState(initialValue);
		const provider = React.useContext(ReactContext);

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				setState(nextState);
			});
		});

		return props.children(state);
	};

	const useState = function(): useStateReturn<T> {
		const [state, setState] = React.useState(initialValue);
		const provider = React.useContext(ReactContext);
		const update: Update<T> = (state: T) => {
			provider.setState(state);
		};

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				setState(nextState);
			});
		});

		return [state, update];
	};

	const useSelector: UseSelector<T, (state: T) => any> = function(selector) {
		const [state, setState] = React.useState(selector(initialValue));
		const provider = React.useContext(ReactContext);
		const update: Update<T> = (state: T) => {
			provider.setState(state);
		};

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				const newState = selector(nextState);
				if (!shallowEqual(state, newState)) {
					setState(newState);
				}
			});
		});

		return [state, update];
	};

	const useUpdate = function() {
		const provider = React.useContext(ReactContext);
		const update: Update<T> = (state: T) => {
			provider.setState(state);
		};

		return update;
	};

	return {
		Provider,
		Consumer,
		useState,
		useSelector,
		useUpdate,
	};
}

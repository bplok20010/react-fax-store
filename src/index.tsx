import React from "react";
import withComponentHooks from "with-component-hooks";
import shallowEqual from "./shallowEqual";

type Update<T> = (state: Pick<T, keyof T> | T | null) => void;
type Subscriber<T> = (prevState: Readonly<T>, nextState: Readonly<T>) => void;
type UseSelector<T> = <S extends (state: T) => any>(selector: S) => ReturnType<S>;
type Consumer<T> = (props: ConsumerProps<T>) => React.ReactNode;
type UseUpdate<T> = () => Update<T>;

interface ConsumerProps<T> {
	children: (state: T) => React.ReactNode;
}

interface Provider<T> extends React.Component<{}, T> {
	subscribe(subscriber: Subscriber<T>): () => void;
}

interface Context<T> {
	Provider: new (props: {}) => Provider<T>;
	Consumer: Consumer<T>;
	useState: () => T;
	useSelector: UseSelector<T>;
	useUpdate: UseUpdate<T>;
}

export const withHooks = withComponentHooks as <T extends React.Component>(component: T) => T;

export function createContext<T extends Record<string, any>>(initialValue: T): Context<T> {
	const ReactContext = React.createContext<Provider<T>>({} as Provider<T>);

	const Provider = class extends React.Component<{}, T> {
		protected _listeners: Subscriber<T>[] = [];

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

	const useState = function(): T {
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
		useState,
		useSelector,
		useUpdate,
	};
}

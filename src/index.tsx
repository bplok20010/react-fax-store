import React from "react";
import withComponentHooks from "with-component-hooks";
import shallowEqual from "./shallowEqual";

export type Update<T = {}> = <K extends keyof T>(state: Pick<T, K> | T | null) => void;
export type Subscriber<T = {}> = (prevState: Readonly<T>, nextState: Readonly<T>) => void;
export type UseSelector<T = {}> = <S extends (state: T) => any>(selector: S) => ReturnType<S>;
export type UseUpdate<T = {}> = () => Update<T>;
export type UseState<T = {}> = () => T;
export type UseProvider<T> = () => Provider<T>;
export type Context<T> = React.Context<T>;

export interface ConsumerProps<T = {}> {
	children: (state: T) => React.ReactElement | null;
}

export type Consumer<T = {}> = React.FC<ConsumerProps<T>>;

export interface Provider<T = {}> extends React.Component<{}, T> {
	getSubscribeCount(): number;
	subscribe(subscriber: Subscriber<T>): () => void;
}

export interface Store<T = {}> {
	Context: Context<T>; //Omit<Context<T>, "Provider">;
	Provider: new (props: {}) => Provider<T>;
	Consumer: Consumer<T>;
	useProvider: UseProvider<T>;
	useState: () => T;
	useSelector: UseSelector<T>;
	useUpdate: UseUpdate<T>;
}

interface StateContextWrapperProps<T> {
	stateContext: Context<T>;
	getState: () => T;
}

export const withHooks = withComponentHooks as <T extends typeof React.Component>(
	component: T
) => T;

export function createStore<T extends Record<string | number | symbol, any>>(
	initialValue: T
): Store<T> {
	const StoreContext = React.createContext<Provider<T>>({
		subscribe(subscribe) {
			// TODO: throw error
		},
	} as Provider<T>);
	const StateContext = React.createContext<T>({} as T);

	class StateContextWrapper extends React.Component<StateContextWrapperProps<T>> {
		render() {
			const { children, stateContext, getState } = this.props;
			return <stateContext.Provider value={getState()}>{children}</stateContext.Provider>;
		}
	}

	const Provider = class extends React.Component<{}, T> {
		protected _listeners: Subscriber<T>[] = [];

		stateContextRef = React.createRef<StateContextWrapper>();

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
				this.stateContextRef.current?.setState({});
				this._listeners.forEach(listener => {
					listener(prevState, this.state);
				});
				callback && callback();
			});
		}

		// no re-render, although current StoreContext.Provider already does not re-render,
		shouldComponentUpdate(nextProps: {}) {
			if (this.props === nextProps) {
				return false;
			}
			return true;
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

		componentWillUnmount() {
			this._listeners.length = 0;
		}

		render() {
			return (
				<StateContextWrapper
					ref={this.stateContextRef}
					stateContext={StateContext}
					getState={() => this.state}
				>
					<StoreContext.Provider value={this}>
						{this.props.children}
					</StoreContext.Provider>
				</StateContextWrapper>
			);
		}
	};

	const Consumer: Consumer<T> = function(props) {
		const [state, setState] = React.useState(initialValue);
		const provider = React.useContext(StoreContext);

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				setState(nextState);
			});
		});

		return props.children(state);
	};

	const useProvider: UseProvider<T> = function() {
		return React.useContext(StoreContext);
	};

	const useState: UseState<T> = function() {
		const [state, setState] = React.useState(initialValue);
		const provider = React.useContext(StoreContext);

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				setState(nextState);
			});
		});

		return state;
	};

	const useSelector: UseSelector<T> = function useSelector(selector) {
		const [state, setState] = React.useState(selector(initialValue));
		const provider = React.useContext(StoreContext);

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
		const provider = React.useContext(StoreContext);

		return state => {
			provider.setState(state);
		};
	};

	StateContext.Provider = function(props) {
		//TODO: throw error
		return props.children;
	} as typeof StateContext.Provider;

	return {
		Context: StateContext,
		Provider,
		Consumer,
		useProvider,
		useState,
		useSelector,
		useUpdate,
	};
}

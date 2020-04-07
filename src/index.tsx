import React from "react";
import invariant from "invariant";
import withComponentHooks from "with-component-hooks";
import shallowEqual from "./shallowEqual";

export const version = "%VERSION%";

export type Update<T = {}> = <K extends keyof T>(
	state: ((prevState: Readonly<T>) => Pick<T, K> | T | null) | Pick<T, K> | T | null
) => void;
export type Subscriber<T = {}> = (prevState: Readonly<T>, nextState: Readonly<T>) => void;
export type UseSelector<T = {}> = <S extends (state: T) => any>(selector: S) => ReturnType<S>;
export type UseUpdate<T = {}> = () => Update<T>;
export type UseState<T = {}> = () => T;
export type UseProvider<T> = () => Provider<T>;
export type Consumer<T = {}> = React.FC<ConsumerProps<T>>;
export type Context<T> = React.Context<T>;
export type ReducerAction = {
	type: string;
	[x: string]: any;
};
export type Reducer<T> = (state: T, action: ReducerAction) => T;
export type Dispatch = (action: ReducerAction) => void;
export type UseDispatch = () => Dispatch;
export interface ConsumerProps<T = {}> {
	children: (state: T) => React.ReactElement | null;
}

export interface Provider<T = {}> extends React.Component<{}, T> {
	__$isProvider: boolean;
	getSubscribeCount(): number;
	subscribe(subscriber: Subscriber<T>): () => void;
	getState(): T;
}

export interface Store<T = {}> {
	Context: Context<T>;
	Provider: new (props: {}) => Provider<T>;
	Consumer: Consumer<T>;
	useProvider: UseProvider<T>;
	useStore: UseProvider<T>;
	useState: () => T;
	useSelector: UseSelector<T>;
	useUpdate: UseUpdate<T>;
}

export interface ReducerStore<T = {}> extends Store<T> {
	useDispatch: UseDispatch;
}

export const withHooks = withComponentHooks as <T extends typeof React.Component>(
	component: T
) => T;

const errorMsg = "You may forget to use the <Store.Provider> package component";

function assertProvider(provider: Provider) {
	invariant(provider.__$isProvider, errorMsg);
}

export function createStore<T extends Record<string | number | symbol, any>>(
	initialValue: () => T
): Store<T> {
	const StoreContext = React.createContext<Provider<T>>({} as Provider<T>);
	const StateContext = React.createContext<T>({} as T);
	const getInitialValue = (): T => {
		return typeof initialValue === "function" ? initialValue() : initialValue;
	};

	const Provider = class extends React.Component<{}, T> {
		protected _listeners: Subscriber<T>[] = [];
		__$isProvider = true;

		getSubscribeCount() {
			return this._listeners.length;
		}

		state: Readonly<T> = getInitialValue();

		getState() {
			return this.state;
		}

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

		// no re-render, although current StoreContext.Provider already does not re-render,
		// shouldComponentUpdate(nextProps: {}) {
		// 	if (this.props === nextProps) {
		// 		return false;
		// 	}
		// 	return true;
		// }

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
				<StateContext.Provider value={this.state}>
					<StoreContext.Provider value={this}>
						{this.props.children}
					</StoreContext.Provider>
				</StateContext.Provider>
			);
		}
	};

	const Consumer: Consumer<T> = function (props) {
		const [state, setState] = React.useState(getInitialValue());
		const provider = React.useContext(StoreContext);

		assertProvider(provider);

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				setState(nextState);
			});
		});

		return props.children(state);
	};

	const useProvider: UseProvider<T> = function () {
		const provider = React.useContext(StoreContext);

		assertProvider(provider);

		return provider;
	};

	const useState: UseState<T> = function () {
		const [state, setState] = React.useState(getInitialValue());
		const provider = React.useContext(StoreContext);

		assertProvider(provider);

		React.useEffect(() => {
			return provider.subscribe((_, nextState) => {
				setState(nextState);
			});
		});

		return state;
	};

	const useSelector: UseSelector<T> = function useSelector(selector) {
		const [state, setState] = React.useState(selector(getInitialValue()));
		const provider = React.useContext(StoreContext);

		assertProvider(provider);

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

	const useUpdate: UseUpdate<T> = function () {
		const provider = React.useContext(StoreContext);

		assertProvider(provider);

		return state => {
			provider.setState(state);
		};
	};

	return {
		Context: StateContext,
		Provider,
		Consumer,
		useProvider,
		useStore: useProvider,
		useState,
		useSelector,
		useUpdate,
	};
}

export function createReducer<T>(reducer: Reducer<T>, initialValue: () => T): ReducerStore<T> {
	const Store = createStore(initialValue);

	const useDispatch: UseDispatch = function () {
		const update = Store.useUpdate();

		return action => {
			update(prevState => {
				return reducer(prevState, action);
			});
		};
	};

	return {
		...Store,
		useDispatch,
	};
}

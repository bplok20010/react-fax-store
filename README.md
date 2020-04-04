# react-fax-store
react-fax-store

## Install

`npm install --save react-fax-store`

## Usage

```js
import {createStore} from 'react-fax-store';

const Store = createStore({text: 'fax-store'});

function App(){
    const data = React.useContext(Store.Context); // {text: 'fax-store'} subscribe state
    const state = store.useState(); // {text: 'fax-store'} subscribe state
    const text = store.useSelector( state => state.text ); // fax-store subscribe only state.text change
    const provider = store.useProvider();
    provider.state; // {text: 'fax-store'}
    const update = store.useUpdate();
    update({
        text : 'react-fax-store'
    });

    return <Store.Consumer>{ state => console.log(state) }</Store.Consumer>
}

<Store.Provider>
    <App />
</Store.Provider>


```

## interface

```ts

export type withHooks = <T>(c:T) => T;

export type createStore = <T extends Record<string | number | symbol, any>>(
	initialValue: T
): Store<T>

 type Update<T = {}> = <K extends keyof T>(state: Pick<T, K> | T | null) => void;
 type Subscriber<T = {}> = (prevState: Readonly<T>, nextState: Readonly<T>) => void;
 type UseSelector<T = {}> = <S extends (state: T) => any>(selector: S) => ReturnType<S>;
 type UseUpdate<T = {}> = () => Update<T>;
 type UseState<T = {}> = () => T;
 type UseProvider<T> = () => Provider<T>;
 type Consumer<T = {}> = React.FC<ConsumerProps<T>>;
 type Context<T> = React.Context<T>;

 interface ConsumerProps<T = {}> {
	children: (state: T) => React.ReactElement | null;
}

 interface Provider<T = {}> extends React.Component<{}, T> {
	getSubscribeCount(): number;
	subscribe(subscriber: Subscriber<T>): () => void;
}

 interface Store<T = {}> {
	Context: Context<T>;
	Provider: new (props: {}) => Provider<T>;
	Consumer: Consumer<T>;
	useProvider: UseProvider<T>;
	useState: () => T;
	useSelector: UseSelector<T>;
	useUpdate: UseUpdate<T>;
}

```

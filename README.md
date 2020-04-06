# react-fax-store
react-fax-store

## 安装

`npm install --save react-fax-store`

## 使用

```js
import {createStore} from 'react-fax-store';

const Store = createStore(() => ({text: 'fax-store'}));

function App(){
    const data = React.useContext(Store.Context); // {text: 'fax-store'} subscribe state
    const state = store.useState(); // {text: 'fax-store'} subscribe state
    const text = store.useSelector( state => state.text ); // fax-store subscribe only state.text change
    const store = store.useStore();
    store.getState(); // {text: 'fax-store'}
    store.setState({
        text : 'react-fax-store'
    });
    // or 
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
---

## `createStore(initialValue: () => {}): Store;`

创建Store对象

```js
import {createStore} from 'react-fax-store';

createStore(() => {
    return {
        ...
    }
})


```

## Store

### `Provider`

```jsx
<Store.Provider>
    ...
</Store.Provider>

```

### Consumer

```jsx
<Store.Provider>
    ...
    <Store.Consumer>
        {state => {
            return <div>{state}</div>
        }}
    </Store.Consumer>
    ...
</Store.Provider>

```

### useState

订阅整个数据

```jsx

function Info(){
    const state = Store.useState();
    return <div>{state}</div>
}

```

### useSelector

订阅指定数据

```jsx

function Info(){
    const state = Store.useSelector(state => {
        return {
            username: state.username
        }
    });
    return <div>{state.username}</div>
}

```

### useUpdate

更新数据

```
function Action(){
    const update = Store.useUpdate(prevState => {
        return {
            username: prevState.username + '_xc'
        }
    });
    return <button onClick={update}>Add</button>
}

```

### useProvider

别名：`useStore`


获取由Provider提供的store数据对象

```
const store = Store.useStore();
store.getState();
// or
store.setState(...)
```

### Context

可直接通过React.useContext获取数据

```
const state = React.useContext(Store.Context);

```



## interface

```ts

export type withHooks = <T>(c:T) => T;

export type createStore = <T extends Record<string | number | symbol, any>>(
	initialValue: () => T
): Store<T>

export type Update<T = {}> = <K extends keyof T>(
	state: ((prevState: Readonly<T>) => Pick<T, K> | T | null) | Pick<T, K> | T | null
) => void;
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
    getState(): T;
}

 interface Store<T = {}> {
	Context: Context<T>;
	Provider: new (props: {}) => Provider<T>;
	Consumer: Consumer<T>;
	useProvider: UseProvider<T>;
	useStore: UseProvider<T>;
	useState: () => T;
	useSelector: UseSelector<T>;
	useUpdate: UseUpdate<T>;
}

```

## Example

`store.js`
```js
import {createStore} from 'react-fax-store';

export default createStore(() => {
    return {
        name: 'react-fax-store';
    }
});
```

`index.js`

```jsx
import React from 'react'
import Store from './store';

function Info(){
    const state = Store.useState();
    return <div>{state.name}</div>
}

function App(){
    return (
        <Store.Provider>
            <Info />
        </Store.Provider>
    );
}

export default App;

```


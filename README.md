# rh-store
sample react hook store 

## Useage

```js
import {rhs} from 'rh-store';

const store = rhs.createContext({});

function App(){
    const state = store.useState();
}

<Store.Provider>
    <App />
</Store.Provider>


```

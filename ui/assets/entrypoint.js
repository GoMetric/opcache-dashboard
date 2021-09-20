import React from 'react';
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension';
import Layout from '/components/Layout.jsx';
import { ThemeProvider } from '@material-ui/core/styles';
import Theme from '/components/Theme.tsx';
import reducer from '/reducers/reducer';
import fetchOpcacheStatuses from '/actionCreators/fetchOpcacheStatuses'
import {BrowserRouter as Router} from "react-router-dom";

// store
let store = createStore(
    reducer,
    composeWithDevTools(
        applyMiddleware(
            thunkMiddleware
        ),
    )
);

// render layout
ReactDOM.render(
    <ThemeProvider theme={Theme}>
        <Provider store={store}>
            <Router>
                <Layout/>
            </Router>
        </Provider>
    </ThemeProvider>,
    document.getElementById('app')
);

// start app
store.dispatch(fetchOpcacheStatuses());

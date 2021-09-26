import React from 'react';
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension';
import Layout from '/components/Layout.tsx';
import { ThemeProvider } from '@material-ui/core/styles';
import Theme from '/components/Theme.tsx';
import reducer from '/reducers/reducer';
import fetchOpcacheStatuses from '/actionCreators/fetchOpcacheStatuses'
import {BrowserRouter as Router} from "react-router-dom";
import {IntlProvider} from 'react-intl';
import {loadLocaleData, detectLocale} from '/tools/l10n';

async function bootstrapApplication(mainDiv) {
    // store
    let store = createStore(
        reducer,
        composeWithDevTools(
            applyMiddleware(
                thunkMiddleware
            ),
        )
    );

    // locale
    const locale = detectLocale()
    const messages = await loadLocaleData(locale)

    // render layout
    ReactDOM.render(
        <ThemeProvider theme={Theme}>
            <Provider store={store}>
                <Router>
                    <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
                        <Layout/>
                    </IntlProvider>
                </Router>
            </Provider>
        </ThemeProvider>,
        mainDiv
    );

    // init data
    store.dispatch(fetchOpcacheStatuses());
}

bootstrapApplication(
    document.getElementById('app')
);




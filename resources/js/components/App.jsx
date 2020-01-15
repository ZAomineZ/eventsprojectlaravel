import React from 'react';
import * as ReactDOM from "react-dom";
import {BrowserRouter, Switch} from "react-router-dom";
import LayoutApp from './LayoutApp';

/* An example React component */
class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <Switch>
                        <LayoutApp />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}

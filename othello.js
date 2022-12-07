"use strict";
/* globals ReactDOM: false */
/* globals React: false */

const App = function(props) {
    /* jshint ignore: start */
    return (
        <div>
            <h1>Hello!</h1>
        </div>
    )
    /* jshint ignore: end */
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
        /* jshint ignore:start */
        <React.StrictMode>
        <App />
    </React.StrictMode>
    /* jshint ignore:end */
);
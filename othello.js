"use strict";
/* globals ReactDOM: false */
/* globals React: false */

const App = function(props) {
    const [state, setState] = React.useState( {
        pelaaja1: "",
        pelaaja2: "",
        kentanKoko: 4
    });

    let handleChange = function(event) {
        console.log(event.target);
    };

    /* jshint ignore: start */
    return (
        <div>
            <h1>Othello</h1>
            <Lomake
                pelaaja1={state.pelaaja1}
                pelaaja2={state.pelaaja2}
                kentanKoko={state.kentanKoko}
                change={handleChange}
            />
        </div>
    )
    /* jshint ignore: end */
};

// ----------- lomake ------------

const Lomake = function(props) {
    /* jshint ignore: start */
    return (
        <div>
            <form>
                <fieldset>
                    <legend>Pelaajat</legend>
                    <LabelAndTextInput
                        type="text"
                        inputText={props.pelaaja1}
                        labelText="Pelaaja 1"
                        change={props.change} />
                    <LabelAndTextInput
                        type="text"
                        inputText={props.pelaaja2}
                        labelText="Pelaaja 2"
                        change={props.change} />
                </fieldset>
                <fieldset>
                    <legend>Kentän koko</legend>
                    <input type="range" min="4" max="16" />
                    <label>Valittu koko: {props.kentanKoko}</label>
                </fieldset>
            </form>
        </div>
    )
    /* jshint ignore: end */
};

const LabelAndTextInput = function(props) {
    /* jshint ignore: start */
    return (
        <label>
            {props.labelText}
            <input type={props.type} value={props.inputText} onChange={props.change} />
        </label>
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
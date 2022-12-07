"use strict";
/* globals ReactDOM: false */
/* globals React: false */

const App = function(props) {
    const [lomake, setLomake] = React.useState( {
        "pelaaja1": "",
        "pelaaja2": "",
        "kentanKoko": 4
    });

    /**
     * Käsittelee inputin muutostapahtumat lomakkeessa
     * @param {Event} event 
     */
    let handleChange = function(event) {
        let uusilomake = {...lomake};
        let obj = event.target;
        console.log("handleChange:", uusilomake, obj);
        // jos kyseessä on tekstikenttä
        if (obj.type == "text") {
            if (obj.value.trim() == "") {
                obj.setCustomValidity("Kirjoita vähintään yksi merkki (ei välilyönti");
            } else {
                obj.setCustomValidity("");
            }
            uusilomake[obj.id] = obj.value;
        // jos kyseessä on kentän kokoa muokkaava slideri
        } else {
            uusilomake[obj.id] = obj.value;
        }
        
        setLomake(uusilomake);
    };

    /* jshint ignore: start */
    return (
        <div>
            <h1>Othello</h1>
            <Lomake
                pelaaja1={lomake.pelaaja1}
                pelaaja2={lomake.pelaaja2}
                kentanKoko={lomake.kentanKoko}
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
                    <label>Pelaaja 1
                        <input
                            type="text"
                            id="pelaaja1"
                            value={props.pelaaja1}
                            onChange={props.change}/>
                    </label>
                    <label>Pelaaja 2
                        <input
                            type="text"
                            id="pelaaja2"
                            value={props.pelaaja2}
                            onChange={props.change}/>
                    </label>
                </fieldset>
                <fieldset>
                    <legend>Kentän koko</legend>
                    <input
                        type="range"
                        id="kentanKoko"
                        min="4" max="16"
                        value={props.kentanKoko}
                        onChange={props.change}/>
                    <label>Valittu koko: {props.kentanKoko}</label>
                </fieldset>
            </form>
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
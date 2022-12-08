"use strict";
/* globals ReactDOM: false */
/* globals React: false */

function App(props) {
    const [lomake, setLomake] = React.useState( {
        "pelaaja1": "",
        "pelaaja2": "",
        "kentanKoko": 4
    });

    const [pelitila, setPelitila] = React.useState(false);

    /**
     * Käsittelee inputin muutostapahtumat lomakkeessa
     * @param {Event} event 
     */
    let handleChangeLomake = function(event) {
        let uusilomake = {...lomake};
        let obj = event.target;

        // jos kyseessä on tekstikenttä
        if (obj.type == "text") {
            uusilomake[obj.id] = obj.value;
            // jos tyhjä
            if (obj.value.trim() == "") {
                obj.setCustomValidity("Kirjoita vähintään yksi merkki (ei välilyönti");
            }
            // jos kaikki kunnossa, custom validity tyhjennetään
            else {
                obj.setCustomValidity("");
            }

            let pelaajakentat = event.target.form["nimi"];
            // tarkistetaan vielä onko samat nimet...
            if (uusilomake.pelaaja1.trim() == uusilomake.pelaaja2.trim()) {
                for (let pk of pelaajakentat) {
                    pk.setCustomValidity("Valitse eri nimi kuin toisella pelaajalla");
                }
            } else {
                for (let pk of pelaajakentat) {
                    pk.setCustomValidity("");
                }
            }

        // jos kyseessä on kentän kokoa muokkaava slideri
        } else {
            uusilomake[obj.id] = obj.value;
        }
        
        setLomake(uusilomake);
    };

    /**
     * Mitä tekee, kun tallentaa lomakkeen (formin napin painallus)
     * @param {Event} event 
     */
    let handleSubmitLomake = function(event) {
        event.preventDefault();
        // jos lomakkeessa on jotain validity-virheitä, ei jatka
        if (!event.target.form.checkValidity()) {
            console.log("virhe");
            event.target.form.reportValidity();
            return;
        }

        // kaikki kunnossa, joten jatkuu
        let uusilomake = {...lomake};
        uusilomake.pelaaja1 = lomake.pelaaja1.trim();
        uusilomake.pelaaja2 = lomake.pelaaja2.trim();
        setLomake(uusilomake);
        
        // muutetaan pelitila
        setPelitila(true);
    };

    /* jshint ignore: start */
    return (
        <div>
            <h1>Othello</h1>
            <PiiloutuvaLomake
                pelitila={pelitila}
                lomake={lomake}
                change={handleChangeLomake}
                tallenna={handleSubmitLomake}
            />
            <Pelilauta
                koko={lomake.kentanKoko}/>
        </div>
    )
    /* jshint ignore: end */
}

// ----------- lomake -----------

/**
 * Luo lomakkeen annetuilla tiedoilla
 * @param {Object} props 
 * @returns komponentin osat html/jsx-muodossa
 */
function Lomake(props) {
    let tallenna = function (event) {
        event.preventDefault();
        props.tallenna(event);
    };
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
                            name="nimi"
                            value={props.lomake.pelaaja1}
                            onChange={props.change}
                            required="required"/>
                    </label>
                    <label>Pelaaja 2
                        <input
                            type="text"
                            id="pelaaja2"
                            name="nimi"
                            value={props.lomake.pelaaja2}
                            onChange={props.change}
                            required="required"/>
                    </label>
                </fieldset>
                <fieldset>
                    <legend>Kentän koko</legend>
                    <input
                        type="range"
                        id="kentanKoko"
                        min="4" max="16"
                        step="2"
                        value={props.lomake.kentanKoko}
                        onChange={props.change}/>
                    <label>Valittu koko: {props.lomake.kentanKoko}x{props.lomake.kentanKoko}</label>
                </fieldset>
                <button onClick={tallenna}>Pelaamaan!</button>
            </form>
        </div>
    )
    /* jshint ignore: end */
}

/**
 * Luo piiloutuvan lomakkeen, joka
 * näyttää lomakkeen, jos ei olla pelitilassa ja
 * piilottaa lomakkeen, kun se on asianmukaisesti täytetty ja lähetetty
 * @param {Object} props 
 * @returns piiloutuva lomake
 */
function PiiloutuvaLomake(props) {

    /* jshint ignore: start */
    if (!props.pelitila) {
        return (
            <Lomake
            lomake={props.lomake}
            change={props.change} 
            tallenna={props.tallenna}/>
        )
    }

    return (
        <h2>Let's play!</h2>
    )
    /* jshint ignore: end */
}


// ----------- pelilauta -----------

function Pelilauta(props) {

    let tyhjaTaulukko = [];
    for (let i = 0; i < props.koko; i++) {
        let rivi = [];
        for (let j = 0; j < props.koko; j++) {
            rivi.push("");
        }
        tyhjaTaulukko.push(rivi);
    }
    
    const [ruudut, setRuudut] = React.useState(tyhjaTaulukko);

    /* jshint ignore: start */
    let riveja = [];
    for (let i = 0; i < props.koko; i++) {
        riveja.push(<Rivi key={i} koko={props.koko} rivi={i} />)
    }
    
    return (
        <div>
            {riveja}
        </div>
    )
    /* jshint ignore: end */
}

function Rivi(props) {
    
    /* jshint ignore: start */
    let osia = [];
    for (let i = 0; i < props.koko; i++) {
        osia.push(<Osa key={props.rivi + i} />)
    }
    return (
        <div>{osia}</div>
    )
    /* jshint ignore: end */
}

function Osa(props) {
    /* jshint ignore: start */
    return (<label className="peliruutu">[ ]</label>)
    /* jshint ignore: end */
}

// ----------- roottiin lisääminen -----------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
        /* jshint ignore:start */
        <React.StrictMode>
        <App />
    </React.StrictMode>
    /* jshint ignore:end */
);
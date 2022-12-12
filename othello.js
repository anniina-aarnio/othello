"use strict";
/* globals ReactDOM: false */
/* globals React: false */

function App(props) {
    const [lomake, setLomake] = React.useState( {
        "pelaaja1": "",
        "pelaaja2": "",
        "kentanKoko": 4,
        "nakyvissa": true
    });

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

        uusilomake.nakyvissa = false;
        setLomake(uusilomake);
    };

    /* jshint ignore: start */
    return (
        <div>
            <h1>Othello</h1>
            <PiiloutuvaLomake
                lomakeNakyvissa={lomake.nakyvissa}
                lomake={lomake}
                change={handleChangeLomake}
                tallenna={handleSubmitLomake}
            />
            <Pelikokonaisuus
                lomakeNakyvissa={lomake.nakyvissa}
                koko={lomake.kentanKoko}
                pelaaja1={lomake.pelaaja1}
                pelaaja2={lomake.pelaaja2} />
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
    if (props.lomakeNakyvissa) {
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


// ----------- pelin kokonaisuus ----------



function Pelikokonaisuus(props) {
    /* jshint ignore:start*/
    // jos lomake näkyvissä eli ei vielä pelitila
    if (props.lomakeNakyvissa) {
        return <div></div>
    }
    /* jshint ignore:end*/

    // alustetaan pelilautataulukko
    let alkutilanne = luoAlkutilanne(props.koko);

    const [ruudut, setRuudut] = React.useState(alkutilanne);

    let pisteet = {pelaaja1: 2, pelaaja2: 2};

    /* jshint ignore:start*/
    return (
        <div id="pelikokonaisuus">
            <Pelilauta
                koko={props.koko}
                ruudut={ruudut}/>
            <PelilaudanSivu
                pelaaja1={props.pelaaja1}
                pelaaja2={props.pelaaja2}
                pisteet={pisteet}/>
        </div>
    )
    /* jshint ignore:end*/
}



// ----------- pelilauta -----------

function Pelilauta(props) {


    /* jshint ignore: start */
    let riveja = [];
    for (let i = 0; i < props.koko; i++) {
        riveja.push(
            <Rivi
                key={i}
                rivi={i}
                koko={props.koko}
                sisallot={props.ruudut[i]} />
        )
    }
    
    return (
        <div id="pelilauta">
            {riveja}
        </div>
    )
    /* jshint ignore: end */
}

/**
 * Luodaan rivit, jotka tekevät ruutuja riville yhtä monta kuin rivejäkin on
 * Rivi luo ruuduille id:t, jotka ovat muotoa "x*-y*" ja * tarkoittaa lukua
 * joka on välillä 0-props.koko
 * (eli esim. 0, 1, 2 tai 3, kun on kyseessä 4 koko) 
 * @param {Object} props 
 * @returns 
 */
function Rivi(props) {
    
    /* jshint ignore: start */
    let osia = [];
    for (let i = 0; i < props.koko; i++) {
        let xy = "x" + i + "-y" + props.rivi;
        osia.push(
            <Ruutu
                id={xy}
                key={props.rivi * Number(props.koko) + i}
                sisalto={props.sisallot[i]}
            />)
    }
    return (
        <div>{osia}</div>
    )
    /* jshint ignore: end */
}


/**
 * Luo ruudun [*] jonka sisällä * tilalla on joko:
 * Tyhja, Musta tai Valkoinen
 * @param {Object} props 
 * @returns 
 */
function Ruutu(props) {

    // mitä tekee kun raahataan X tai O sivusta päälle
    let dragOver = function (event) {
        event.preventDefault();
        // jos raahattava on mustan nappula
        if (event.dataTransfer.types.includes("musta")) {
            event.dataTransfer.dropEffect = "move";
        // jos raahattava on valkoisen nappula
        } else if (event.dataTransfer.types.includes("valkoinen")) {
            event.dataTransfer.dropEffect = "move";
        // jos raahattava on mitä tahansa muuta
        } else {
            event.dataTransfer.dropEffect = "none";
        }
    };

    // mitä tekee kun tiputtaa X tai O sivusta päälle
    let drop = function (event) {
        event.preventDefault();
        let dataMusta = event.dataTransfer.getData("musta");
        let dataValkoinen = event.dataTransfer.getData("valkoinen");
        if (dataMusta) {
            console.log("drop musta: ", dataMusta, event.target.parentElement);
        } else if (dataValkoinen) {
            console.log("drop valkoinen:", dataValkoinen);
        } else {
            console.log("drop jokin muu tiputus");
        }
    };

    /* jshint ignore: start */
    let musta = <Musta />;
    let valkoinen = <Valkoinen />;
    let tyhja = <Tyhja teeDragOver={dragOver} teeDrop={drop}/>;

    if (props.sisalto == " ") {
        return (<label id={props.id}
                className="peliruutu">[{tyhja}]</label>)
    } else if (props.sisalto == "X") {
        return (<label id={props.id} className="peliruutu">[{musta}]</label>)
    } else {
        return (<label id={props.id} className="peliruutu">[{valkoinen}]</label>)
    }
    /* jshint ignore: end */
}

function Tyhja(props) {
    /* jshint ignore: start */
    return <label onDragOver={props.teeDragOver} onDrop={props.teeDrop} name="tyhja"> </label>
    /* jshint ignore: end */
}

function Valkoinen(props) {
    /* jshint ignore: start */
    return <label className="valkoinen">O</label>
    /* jshint ignore: end */
}

function Musta(props) {
    /* jshint ignore: start */
    return <label className="musta">X</label>
    /* jshint ignore: end */
}

// ----------- pelilaudan sivun asiat -----------

function PelilaudanSivu(props) {
    /* jshint ignore:start */
    return (
        <div id="sivuosa">
            <PelaajanTiedot
                pelaaja={props.pelaaja1}
                pisteet={props.pisteet.pelaaja1}
                color="musta"
                merkki="X"/>
            <PelaajanTiedot
                pelaaja={props.pelaaja2}
                pisteet={props.pisteet.pelaaja2}
                color="valkoinen"
                merkki="O"/>


        </div>
    )
    /* jshint ignore:end */
}

function PelaajanTiedot(props) {
    /* jshint ignore:start */
    return (
        <div id="pelaajatiedot">
            <div>
                <label>{props.pelaaja}</label>
            </div>
            <div>
                <label>Pisteet:{props.pisteet}</label>
            </div>
            <div>
                <Pelimerkki color={props.color} merkki={props.merkki}/>
            </div>
        </div>

    )
    /* jshint ignore:end */
}

function Pelimerkki(props) {
    let dragStart = function(event) {
        event.dataTransfer.setData(event.target.getAttribute("name"), event.target.getAttribute("name"));
        console.log("raahauksen alku", event.target.getAttribute("name"));
    };

    let dragEnd = function(event) {
        console.log("raahauksen loppu", event.target.getAttribute("name"));
    };


    /* jshint ignore:start */
    return (
        <label
            name={props.color}
            className={props.color}
            draggable="true"
            onDragStart={dragStart}
            onDragEnd={dragEnd}>
                {props.merkki}
        </label>
    )
    /* jshint ignore:end */
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


// ----------- apufunktiot -----------

/**
 * Ottaa parametrina taulukon sivun pituuden ja luo sen perusteella taulukon,
 * jossa on alkuasetelma pelinappuloita valmiina
 * esim. koko = 4: (_ tarkoittaa tyhjää ruutua)
 * _ _ _ _
 * _ x o _
 * _ o x _
 * _ _ _ _
 * @param {Number} koko 
 * @returns taulukko, jossa ruudut jokaiselle pelilaudan ruudulle alkutilanteena
 */
function luoAlkutilanne(koko) {
    let tyhjaTaulukko = [];
    let keski = koko / 2;
    
    for (let i = 0; i < koko; i++) {
        let rivi = [];
        for (let j = 0; j < koko; j++) {
            if (i == keski -1 && j == keski - 1) {
                rivi.push("X");
            } else if (i == keski -1 && j == keski) {
                rivi.push("O");
            } else if (i == keski && j == keski - 1) {
                rivi.push("O");
            } else if (i == keski && j == keski) {
                rivi.push("X");
            } else {
                rivi.push(" ");
            }
        }
        tyhjaTaulukko.push(rivi);
    }
    return tyhjaTaulukko;
}
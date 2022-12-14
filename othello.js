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


/**
 * Ylläpitää pelin kaikkea toiminnallisuutta
 * Ruudut-statessa pysyy tieto mustien ja valkoisten nappuloiden tilanteesta
 * - "X" kuvaa mustia nappuloita
 * - "O" valkoisia nappuloita
 * - " " tyhjiä paikkoja
 * - "r" reunapaikkoja (eli tyhjiä, joissa vähintään yksi X tai O vieressä)
 * - "x" mahdollisia paikkoja mustalle
 * - "o" mahdollisia paikkoja valkoiselle
 * @param {Object} props 
 * @returns 
 */
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
    const [vuoro, setVuoro] = React.useState("musta");

    function laskeMahdollisetPaikat(taulukko) {
        // etsitään vastakkaista kuin oma vuoro on
        // oletuksena musta, mutta jos valkoisen vuoro, vaihdetaan tiedot valkoiseksi
        let oma = "X";
        let vastustaja = "O";
        let omaMahdollinen = "x";
        if (vuoro == "valkoinen") {
            oma = "O";
            vastustaja = "X";
            omaMahdollinen = "o";
        }

        // käydään läpi kaikki ruudut
        for (let i = 0; i < taulukko.length; i++) {
            for (let j = 0; j < taulukko[i].length; j++) {
                let ruutu = taulukko[i][j];
                // jos on reunaruutu (eli vieressä on mikä tahansa nappula) 
                if (ruutu == "r" || ruutu == "x" || ruutu == "o") {
                    if (vieressaOnSopiva(vastustaja, i, j, oma)) {
                        taulukko[i][j] = omaMahdollinen;
                    }
                }
            }
        }

        /**
         * katsoo onko ympärillä viereisissä vastustajan merkki
         * ja jos on, tarkistaa onko sen takana heti tai myöhemmin oma merkki
         * @param {String} vMerkki vastustajan merkki, jota etsitään
         * @param {Number} y pisteen, jonka mahdollista sopivuutta tutkitaan, y
         * @param {Number} x pisteen, jonka mahdollista sopivuutta tutkitaan, x
         * @param {String} oMerkki oma merkki, joka tulisi olla vastustajan takana
         */
        function vieressaOnSopiva(vMerkki, y, x, oMerkki) {
            let alkuY = y-1;
            if (alkuY < 0) {
                alkuY = 0;
            }
            let alkuX = x-1;
            if (alkuX < 0) {
                alkuX = 0;
            }
            let loppuY = y+1;
            if (loppuY >= taulukko.length -1) {
                loppuY = taulukko.length -1;
            }
            let loppuX = x+1;
            if (loppuX >= taulukko.length -1) {
                loppuX = taulukko.length -1;
            }
            for (let i = alkuY; i <= loppuY; i++) {
                for (let j = alkuX; j <= loppuX; j++) {
                    if (taulukko[i][j] == vMerkki) {
                        console.log(y,x, "vieressä on vihu:", i, j);
                        return vastustajanTakanaOn(oMerkki, i, j, vMerkki, y, x);
                    }
                }
            }
        }


        /**
         * Etsii rekursiivisesti onko vastustajan merkin/merkkien takana oma
         * @param {String} oMerkki oma merkki, jonka pitäisi olla 
         * @param {Number} y 
         * @param {Number} x
         * @param {String} vMerkki
         * @param {Number} vastY 
         * @param {Number} vastX 
         * @returns true jos löytyy, false jos ei löydy
         */
        function vastustajanTakanaOn(oMerkki, y, x, vMerkki, vastY, vastX) {
            //tarkistetaan mihin suuntaan ollaan lähdössä

            // vaakasuunta
            if (y-vastY == 0) {
                // vasemmalle
                if (x-vastX > 0) {
                    console.log("vastustajan merkki olisi vasemmalla", vastY, vastX, y, x);
                    for (let j = vastX; j >= 0; j--) {
                        // jos edelleen vastustajan merkki
                        if (taulukko[y][j] == vMerkki) {
                            vastustajanTakanaOn(oMerkki, y, x, vMerkki, y, j);
                        // jos oma merkki suoraan vastustajan takana
                        } else if (taulukko[y][j] == oMerkki) {
                            return true;
                        // jos jokin muu merkki
                        } else {
                            return false;
                        }
                    }
                // oikealle
                } else {
                    for (let j = vastX; j < taulukko.length; j++) {
                        // jos edelleen vastustajan merkki
                        if (taulukko[y][j] == vMerkki) {
                            vastustajanTakanaOn(oMerkki, y, x, vMerkki, y, j);
                        // jos oma merkki suoraan vastustajan takana
                        } else if (taulukko[y][j] == oMerkki) {
                            return true;
                        //jos jokin muu merkki
                        } else {
                            return false;
                        }
                    }
                }
            }

            return false;
        }
    }

    // kirjaa uudet reunapalat juuri laitetun merkin ympärillä
    // oleviin tyhjiin ruutuihin
    function kirjaaUudetReunapaikat(taulukko, koordinaatit) {
        let y = koordinaatit.y;
        let x = koordinaatit.x;
        let alkuY = y-1;
        if (alkuY < 0) {
            alkuY = 0;
        }
        let alkuX = x-1;
        if (alkuX < 0) {
            alkuX = 0;
        }
        let loppuY = y+1;
        if (loppuY >= taulukko.length) {
            loppuY = taulukko.length;
        }
        let loppuX = x+1;
        if (loppuX >= taulukko.length) {
            loppuX = taulukko.length;
        }
        for (let i = alkuY; i <= loppuY; i++) {
            for (let j = alkuX; j <= loppuX; j++ ) {
                if (taulukko[i][j] == " ") {
                    taulukko[i][j] = "r";
                }
            }
        }
    }

    /**
     * 
     * @param {Array} koordinaatit (mihin ruutuun nappula on vedetty)
     * @param {String} merkki "X" tai "O" (musta == X, valkoinen == O) 
     */
    let handleChange = function(koordinaatit, merkki) {
        let uudetRuudut = kopioiTaulukko(ruudut);
        uudetRuudut[koordinaatit.y][koordinaatit.x] = merkki;
        kirjaaUudetReunapaikat(uudetRuudut, koordinaatit);

        laskeMahdollisetPaikat(uudetRuudut);

        setRuudut(uudetRuudut);

        if (vuoro == "musta") {
            setVuoro("valkoinen");
        } else {
            setVuoro("musta");
        }
    };

    // lasketaan tämän hetken pisteet pelilaudalla
    let pisteet = {pelaaja1: 0, pelaaja2: 0};
    for (let i = 0; i < props.koko; i++) {
        for (let j = 0; j < props.koko; j++) {
            if (ruudut[i][j] == "X") {
                pisteet.pelaaja1 += 1;
            } else if (ruudut[i][j] == "O") {
                pisteet.pelaaja2 += 1;
            }
        }
    }


    /* jshint ignore:start*/
    return (
        <div id="pelikokonaisuus">
            <Pelilauta
                koko={props.koko}
                ruudut={ruudut}
                muutaSisaltoa={handleChange}
                vuoro={vuoro}/>
            <PelilaudanSivu
                pelaaja1={props.pelaaja1}
                pelaaja2={props.pelaaja2}
                pisteet={pisteet}
                vuoro={vuoro}/>
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
                sisallot={props.ruudut[i]}
                vuoro={props.vuoro}
                muutaSisaltoa={props.muutaSisaltoa}/>
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
                vuoro={props.vuoro}
                sisalto={props.sisallot[i]}
                muutaSisaltoa={props.muutaSisaltoa}
            />)
    }
    return (
        <div>{osia}</div>
    )
    /* jshint ignore: end */
}


/**
 * Luo ruudun [*] jonka sisällä * tilalla on joko:
 * TyhjaDropilla, Tyhja, Musta tai Valkoinen
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
        let ruutu = ruudunKoordinaatit(event.target.parentElement.id);
        if (dataMusta) {
            props.muutaSisaltoa(ruutu, "X");
            console.log("drop musta: ", dataMusta, ruutu);
        } else if (dataValkoinen) {
            props.muutaSisaltoa(ruutu, "O");
            console.log("drop valkoinen:", dataValkoinen);
        } else {
            console.log("drop jokin muu tiputus");
        }
    };

    /* jshint ignore: start */
    let musta = <Musta />;
    let valkoinen = <Valkoinen />;
    let tyhja = <Tyhja />;
    let tyhjaDropilla = <TyhjaDropilla teeDragOver={dragOver} teeDrop={drop}/>;

    // tyhjä tai reunapala jolla ei muuta tietoa
    if (props.sisalto == " " || props.sisalto == "r") {
        return (<label id={props.id} className="peliruutu">[{tyhja}]</label>)
    // jos X
    }else if (props.sisalto == "X") {
        return (<label id={props.id} className="peliruutu">[{musta}]</label>)
    // jos O
    } else if (props.sisalto == "O") {
        return (<label id={props.id} className="peliruutu">[{valkoinen}]</label>)
    // jos mustan vuoro
    } else if (props.vuoro == "musta") {
        // jos mahdollinen paikka mustalle
        if (props.sisalto == "x") {
            return (<label id={props.id}
                className="tiputus">[{tyhjaDropilla}]</label>)
        // jos ei mahdollinen paikka mustalle
        } else {
            return (<label id={props.id} className="peliruutu">[{tyhja}]</label>)
        }
    // jos valkoisen vuoro
    } else if (props.vuoro == "valkoinen") {
        // ja valkoiselle mahdollinen paikka
        if (props.sisalto == "o") {
            return (<label id={props.id}
                className="tiputus">[{tyhjaDropilla}]</label>)            
        } else {
            return (<label id={props.id} className="peliruutu">[{tyhja}]</label>)            
        }
    }
    // jos jokin ihme tilanne joka ei ylempänä selviä
    return (<label id={props.id} className="peliruutu">[{tyhja}]</label>)
    /* jshint ignore: end */
}

function Tyhja(props) {
    /* jshint ignore: start */
    return <label name="tyhja"> </label>
    /* jshint ignore: end */
}

function TyhjaDropilla(props) {
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
                merkki="X"
                vuoro={props.vuoro}/>
            <PelaajanTiedot
                pelaaja={props.pelaaja2}
                pisteet={props.pisteet.pelaaja2}
                color="valkoinen"
                merkki="O"
                vuoro={props.vuoro}/>


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
                <Pelimerkki vuoro={props.vuoro} color={props.color} merkki={props.merkki}/>
            </div>
        </div>

    )
    /* jshint ignore:end */
}

/**
 * Huolehtii dragStartista ja dragEndistä riippuen siitä,
 * onko vuoro sama kuin annettu väri
 * Jos on sama, silloin draggable="true"
 * Jos on eri, mitään drageja ei ole
 * @param {Object} props 
 * @returns 
 */
function Pelimerkki(props) {
    let dragStart = function(event) {
        event.dataTransfer.setData(event.target.getAttribute("name"), event.target.getAttribute("name"));
        console.log("raahauksen alku", event.target.getAttribute("name"));
    };

    let dragEnd = function(event) {
        console.log("raahauksen loppu", event.target.getAttribute("name"));
    };


    /* jshint ignore:start */
    if (props.vuoro == props.color) {

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
    } else {
        return (
            <label
                name={props.color}
                className={props.color}>
                    {props.merkki}
            </label>
        )   
    }
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
 * X on musta, O on valkoinen ja r on reunapaikka
 * esim. koko = 6: (_ tarkoittaa tyhjää ruutua)
 * _ _ _ _ _ _
 * _ r r r r _
 * _ r x o r _
 * _ r o x r _
 * _ r r r r _
 * _ _ _ _ _ _
 * @param {Number} koko 
 * @returns taulukko, jossa ruudut jokaiselle pelilaudan ruudulle alkutilanteena
 */
function luoAlkutilanne(koko) {
    let tyhjaTaulukko = [];
    let keski = koko / 2;
    
    for (let i = 0; i < koko; i++) {
        let rivi = [];
        for (let j = 0; j < koko; j++) {
            if (i == keski -2 && j == keski-2) {
                rivi.push("r");
            } else if (i == keski-2 && j == keski -1) {
                rivi.push("o");
            } else if (i == keski-2 && j== keski) {
                rivi.push("x");
            } else if (i == keski-2 && j== keski + 1) {
                rivi.push("r");
            } else if (i == keski-1 && j == keski -2) {
                rivi.push("o");
            } else if (i == keski-1 && j == keski +1) {
                rivi.push("x");
            } else if (i == keski && j == keski - 2) {
                rivi.push("x");
            } else if (i == keski && j == keski + 1) {
                rivi.push("o");
            } else if (i == keski+1 && j == keski - 2) {
                rivi.push("r");
            } else if (i == keski+1 && j == keski -1) {
                rivi.push("x");
            } else if (i== keski+1 && j == keski) {
                rivi.push("o");
            } else if (i == keski+1 && j == keski+ 1) {
                rivi.push("r");
            } else if (i == keski -1 && j == keski - 1) {
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

/**
 * Palauttaa annetun xy-merkkijonon perusteella koordinaatit
 * x*-y** -> palastellaan ensin x* ja y**, josta poimitaan:
 * koordinaatit.x = *
 * koordinaatit.y = **
 * @param {String} xy muotoa "x*-y**" jossa * ja ** on mikä tahansa numero 0-16 
 * @returns {Object} sisällöltään: x: *, y: **
 */
function ruudunKoordinaatit(xy) {
    let koordinaatit = {x: 0, y:0};
    let osat = xy.split("-");
    koordinaatit.x = Number(osat[0].substring(1, osat[0].length));
    koordinaatit.y = Number(osat[1].substring(1, osat[1].length));
    return koordinaatit;
}


/**
 * Kopioi kahden syvyisen taulukon deeppinä
 * @param {Array} taulukko muotoa [[],[],[]] 
 */
function kopioiTaulukko(taulukko) {
    let uudetRuudut = [];
    for (let i = 0; i < taulukko.length; i++) {
        let rivi = [...taulukko[i]];
        uudetRuudut.push(rivi);
    }
    return uudetRuudut;
}
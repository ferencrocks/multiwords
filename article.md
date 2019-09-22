# 

A React + Redux ♥. Mióta használom ezt a kombót, mindig is szerettem volna kipróbálni őket együtt, egy webes játékban. Miért is ne? Mindkettő játékra született ha az embernek van némi fantáziája hozzá. Szóval írtam egy korábbi cikket a [szókirakós játék megoldásait megfejtő algoritmusról](https://ferenc.rocks/dev/2019/09/szokirakos-jatek-javascriptben-1-resz/), s gondoltam ideje lenne tovább göngyölíteni a fonalat: csak azért is írok egy webes **multiplayer szókirakós játékot**! Így született meg a *Multiwords* ötlete.

 Mivel nyílván egy demo termékről van szó, elsősorban a megvalósítási része érdekel, kevésbé a design vagy a leheletnyi részletek. Bocsássék meg nekem tehát, ha a grafika vagy az effektusok háttérbe szorulnak. Legalább is egy időre. (*Note to myself: érdekes lenne egy cikket csak erre a témára szánni*).
 
 Szóval fogtam magam, és generáltam egy React setupot a mindig hasznos [create-react-app](https://github.com/facebook/create-react-app) szkripttel, így:
 
 `$ npx create-react-app multiwords`
 
 *Ha esetleg valaki még nem találkozott az `npx`-el, ez egy npm-es cucc kimondottan efféle, eddig a `-g` flaggel globálisan telepített command line toolok egyszerűbb használatára. Azaz a szkript nem települ fel, csupán addig használom amíg szükségem van rá. Így például nem kell aggódnom azon, hogy vajon éppen melyik verzióját telepítettem anno globálisan: mindig a legújabb pörög fel az npx-el.*
 
## Csomagok
 
Bár a create-react-app nagyjából mindent feltelepített, amire egy alap React alkalmazásnak szüksége lehet, még pár dolgot be kellett dobnom a kosárba:
 
 * **Redux**: kelleni fog az alap Redux csomag, illetve a react-redux a React-specifikus feladatokhoz. `$ npm install redux react-redux redux-logger --save`
 * **React router**: nem lett volna feltétlenül szükséges ebben a fázisban, de biztos akartam lenni benne, hogy működik. `$ npm install react-router-dom --save`
 * **node-sass**: szeretem a Sass-t, jöhet a kosárba! `$ npm install node-sass --save`
 * **Lodash**: mit is kezdenénk utility függvények nélkül? Ja igen, mondjuk megírnánk őket. De nem erről szól ez a projekt... `$ npm install lodash --save`
 * **classnames**: ez egy picike, de annál hasznosabb utility a class nevek összefűzésére. `$ npm install classnames --save`

## Routing

Nincs mit filozofálni ezen. Egyszerűen bekötöttem a react router providerét, majd létrehoztam két ártatlan kis útvonalat egy-egy dummy komponenssel. Az egyik a `/lobby`, mely ugyan nem tárgya a mai cikknek, de később itt alakulnak majd a játék szobái. Értelemszerűen `/room/:id` egy ID alapján azonosított szoba route-ja.

## Redux

Két alap feladat van a redux esetében:
#### Létrehozni egy alkalmazás szintű redux store-t.

redux-store.js:
```javascript
import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';

import { board } from './board/state/board-state';

export default createStore(
  combineReducers({
    board
  }),
  applyMiddleware(logger)
);
```

Bekötöttem a redux-loggert, hogy egyszerűen menjen a debugolás. Illetve egyetlen board nevű reducert, amiről majd később mesélek.

#### Behúzni a providerét az App komponensbe, megadván neki a store instance-t.

Tehát az App.js-ünk így néz ki most:
```javascript
import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from 'react-redux';

import './App.css';
import store from './redux-store';
import {GameRoom} from "./game-room/GameRoom";
import {Lobby} from "./lobby/Lobby";


function App() {
  return (
    <Provider store={store}>
      <Router>
        <Route path="/lobby" component={Lobby} />
        <Route path="/room/:id" component={GameRoom} />
      </Router>
    </Provider>
  );
}
export default App;
```

Semmi fancység, csupán a kötelező szükségletek. Btw, egy egyszerű de hasznos cheat sheet (nem csak) Redux kezdőknek: [https://devhints.io/redux](https://devhints.io/redux).

## A "tábla"

Pfjúú, végre megszabadultam a formaságoktól! Akkor most jöhet a szórakozás! Oké, hát ki-ki maga döntse el mit jelent számára a szórakozás egy hűvöskés szeptemberi szombat délután! :)

Szóval két komponenssel dolgozunk ma. Az egyik a `Board`. Ez fogja majd össze a `Letter` komponenseket, illetve ez kommunikál majd a redux-szal. A Letter-ök tehát csak és kizárólag a Board-al állnak kapcsolatban, nem különösebben érdeklődve a redux state-ek iránt.

Először is megtanítjuk a Board komponensünket, hogyan renderelje a tábla betűit. Aztán pedig meg CSS-eljük a dolgokat, hogy lássunk is valami konkrét eredményt az egészből! Nos a táblánknak első sorban tudnia kell, hogy mekkora tábláról is van szó. 3x3, 4x4, stb. Ugyancsak kíváncsi arra, hogy mely betűkkel kell gazdálkodnia. Ezeket prop formájában kapja meg:

```javascript
import React from 'react';
import PropTypes from 'prop-types';
import range from 'lodash/range';
import style from './Board.module.scss';

export const Board = ({ size }) => {
  return (
    <section className={style.board}>
      {range(size).map(row =>
        range(size).map(col =>
          <Letter
            row={row}
            col={col}
            letter={letters[row * size + col]}
            key={`${row}_${col}`} />)
      )}
    </section>
  );
};
Board.propTypes = {
  size: PropTypes.number.isRequired,
  letters: PropTypes.array.isRequired
};

export default Board;
```

A Letter komponensünk értelemszerűen egy egyszerű divet renderel, benne a betűvel. Ráréünk később fejlesztgetni. Inkább az a kérdés, hogy milyen formában pozicionáljuk a rácsunkat, hogy példának okáért egy 3x3-as táblánk jelenjen meg a képrenyőn? Talán táblázattal? Áá, ugyan, az olyan 90-es évek. Használjunk valami olyat, ami rugalmas és flexibilis és sokkal kúlabb annál! Igen, jöhet a CSS Grid! S ha már behúztam a Sass-t is a játékba, legenerálhatnám dinamikusan a megfelelő grid beosztásokhoz szükséges classeket, valahogyan így:

```scss
@import "./variables";

.board {
  display: grid;
  grid-gap: $board-gap;
  height: 400px;
  width: 400px;

  @media (max-width: 768px) {
    height: 95vmin;
    width: 95vmin;
  }

  @for $size from $min-board-size to $max-board-size {
    &.board--#{$size} {
      grid-template-rows: repeat($size, 1fr);
      grid-template-columns: repeat($size, 1fr);
    }
  }
}
```

`.board.board--NxN` classeket generálok, ahol $min-board-size <= N <= $max-board-size. Láthatóan statikus méretet adunk a konténernek, de kisebb felbontásokon átáll folyékonyra. A `vmin` a `vw` (viewport width) és `vh` (viewport height) mértékegységek kiegészítése, mely a vw és vh közül a kissebbik értéket jelöli. Ez érdekes lehet például telefonon, ha a felhasználó landscape módban böngészik, hiszen akkor a tábla szélessége a viewport magasságával lesz egyenlő. Amúgy létezik `vmax` is, hasonló logikával.

 A Letter CSS-e teljesen unalmas, pontosan az amire számítanál. Egy kis trükköt azért megosztok, ami számomra is új, de életmentő volt ebben az esetben. A kérdés ugyanis az volt, hogyan méretezhetném mobilon responsive-an a betűket? Nincs erre spéci CSS eszköz, nagyrészt csak jQuery pluginok, amiktől nyílván próbálom távol tartani magam ez esetben. Találtam viszont a CSS Tricksen egy elmés kis megoldást: size-old a fontot a viewport függvényében. Zseniális! Pont erre volt szükségem:
 
```scss
@media (max-width: 768px) {
  font-size: 15vmin;
}
```

Nyílván játszanom kellett az értékkel egy kicsit, míg végül belőttem a kívánt méretet. Viszont nagyszerűen működik!

Itt tartunk most:
TODO

## A board reducer

Ugye a játék lényege az, hogy amint a jobb klikket lenn tartva húzom az egeremet a tábla betűin, azok kiválasztódnak, majd mikor elengedem az egér gombját, a leírt útvonal sorrendjében egy szó alakul ki. A cél pedig, hogy a szó értelmes legyen, ekkor kap a felhasználó pontokat. Természetesen az egér lehet akár a felhasználó ujja is az érintős képernyőn, elvégre a többség mobilon lóg mostanság.

 Először meghatároztam azt a három actiont, ami ez esetben felmerülhet:
 * SELECTION_MODE: A felhasználó egerének gombjá lenyomta, vagy az ujját a képernyőre helyezte.
 * LETTER_COORD_SELECTED: A felhasználó mozgatja az egerét/ujját a képernyőn, s ezáltal egy betű kiválasztódik.
 * WORD_SELECTED: A falhasználó elengedte az egere gombját, vagy felemelte az ujját a képernyőről, így a szó kiválasztása befejeződött.
 
 Ezeket az actionöket bevezettem a board reducerbe:
 
```javascript
export const SELECTION_MODE = 'SELECTION_MODE';
export const selectionMode = enabled => ({ type: SELECTION_MODE, enabled });

export const WORD_SELECTED = 'WORD_SELECTED';
export const wordSelected = () => ({ type: WORD_SELECTED });

export const LETTER_COORD_SELECTED = 'LETTER_COORD_SELECTED';
export const letterCoordSelected = ([row, col]) => ({ type: LETTER_COORD_SELECTED, coord: [row, col] });

const boardInitialState = {
  size: 4,
  selectionMode: false,
  letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
  selectedLetterCoords: [],
  selectedWord: ''
};

export function board(state = boardInitialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
```

Meghatároztam az initial state-et is, melybe hardcode-oltam pár (a jövőbeli) szervertől kapott értéket, s így nem részei a mostani cikknek. Egyelőre a reducer üres. Töltsük meg!

A **SELECTION_MODE** reducere egyértelmű:
```javascript
case SELECTION_MODE:
  return {...state, selectionMode: action.enabled};
```

A **LETTER_COORD_SELECTED** action már komplexebb. Tény viszont, hogy a betűkiválasztás teljes logikáját tartalmazza, így a komponenseknek (szerencsére) nem kell bajlódniuk a "biznisz logikával":
```javascript
case LETTER_COORD_SELECTED:
  const wasSelectedBeforeTheLastLetter = isEqual(state.selectedLetterCoords[state.selectedLetterCoords.length - 2], action.coord);
  const isSelectedLetter = state.selectedLetterCoords.find(equalsCoord(action.coord));

  if (
    state.selectedLetterCoords.length
    && (
      // The letter wasn't selected before, but it's not the last selected letter's neighbour
      (!isSelectedLetter && !coordsAreNeighbours(last(state.selectedLetterCoords), action.coord))
      // The letter was selected before, but it's not the previously selected one
      || (isSelectedLetter && !wasSelectedBeforeTheLastLetter)
    )
  ) {
    // don't do anything
    return {...state};
  }
  else if (wasSelectedBeforeTheLastLetter) {
    // The letter was selected before the current one --> deselect the current letter
    return {...state, selectedLetterCoords: dropRight(state.selectedLetterCoords)};
  }
  else {
    // Select the new letter
    return {...state, selectedLetterCoords: [...state.selectedLetterCoords, action.coord]};
  }
```

Húú, sok minden van itt. Vegyük sorra. 
#### `wasSelectedBeforeTheLastLetter`
Ez a flag azt tárolja, hogy a kiválasztandó nem-e az utolsó előtt kiválasztott betű? Miért fontos ez? Ha megnézed az alábbi gifet, megérted: 

Tehát az útvonalat nem csak növelni lehet, de csökkenteni is úgy, hogy visszafele haladsz rajta. Tehát ha az utolsó előtt kiválasztott betűre lépsz, az utolsó betű törlődik a `selectedLetterCoords` listából. Ezt csinálja az else-if ág.

#### `isSelectedLetter`
Ez azt nézi, hogy a kiválasztandó betű nem-e kiválasztott már. Az if ág ennek segítégével éri el, hogy már kiválasztott betűk ne legyenek újra kiválaszthatóak. Illetve, hogy olyan betűket se tudj kiválasztani, melyek nem szomszédjai az útvonal farkának. Példa:

TODO!

Végül a spéci esetek kizárása után az else ág növeli a bejárt útvonalat egy újabb betűvel. *Érdemes megjegyezni, hogy a reducer mindig újonan létrehozott objektumokat térít vissza, soha sem az előzőt módosítja (mutálja). Ez extra fontos ha reduxban dolgozik az ember, különben nagyon furcsa esetek állhatnak elő. Talán egyszer írok erről egy röpke okfejtést.* 

Maradt **WORD_SELECTED** reducer, mely a felhasználó által bejárt útvonal betűit szó stringgé ragasztja össze:
```javascript
case WORD_SELECTED:
  const selectedWord = state
    .selectedLetterCoords.map(([row, col]) => {
      return state.letters[row * state.size + col];
    })
    .join('');
  return {...state, selectedWord, selectedLetterCoords: []};
```

A szó kiválasztása után az útvonal kiürül, s a felhasználó újabb kiválasztásba kezdhet.

## Eventek és a `ConnectedBoard`

Most, hogy a reducert ilyen szépen összekalapáltuk, ideje lenne összekötni a szálakat, s játszadozni egy kicsit a felhasználói felületen. Először a `Board`-ot kellene reduxra kapcsolnunk. Nos, nincs ebben semmi extra, egyszerűen csak használjuk a `react-redux` csomag connect utility-jét, így:

```javascript
import {connect} from 'react-redux';
// ....
export const ConnectedBoard = connect(
  (state) => ({
    size: state.board.size,
    letters: state.board.letters,
    selectionMode: state.board.selectionMode,
    selectedLetterCoords: state.board.selectedLetterCoords
  }),
  (dispatch) => ({
    enableSelectionMode: (coord) => {
      dispatch(selectionMode(true));
      dispatch(letterCoordSelected(coord));
    },
    disableSelectionMode: () => {
      dispatch(selectionMode(false));
      dispatch(wordSelected());
    },
    handleLetterSelection: (coord) => {
      dispatch(letterCoordSelected(coord))
    }
  })
)(Board);
export default ConnectedBoard;
```

Az első argumentumban bekötöttük a redux store state-jeit a Board komponens propjaiba. A másodikban pedig néhány action dispatcher függvényt kötünk ugyancsak propokként a komponensünkhöz. Ismervén a reducer működését a kód magáért beszél:

* `enableSelectionMode`: mikor a user klikkel/tappel, a kiválasztó mód aktiválódik, s az éppen hoverelt betű ki is választódik az útvonal első elemeként
* `disableSelectionMode`: a user elengedte a mouse-t/képernyőt, a kiválasztó mód megszűnik, s az útvonalon kiválasztott betűk összessége szóvá alakul
* `handleLetterSelection`: amint a user kiválasztó módban mozgatja az egerét/ujját, az érintett betűk hozzácsapódnak az útvonalhoz (spéci esetben leválnak arról, lásd a reducerbeli okfejtést)

A connect függvény egy *új*, [higher-order komponenst](https://reactjs.org/docs/higher-order-components.html) hoz létre, mely alapvetően hidat képez az eredeti Board és a redux state között. Elegáns.

Apu, kezdődik! :) Már majdnem ott vagyunk. Mindössze be kell kötnünk a UI eventeket a Board komponensben. Az eredeti terv az volt, hogy a Letter komponens közölje propokon keresztül a Board-al az "onMouseEnter" és az "onMouseDown" eventeket. A board pedig továbbítja ezeket a connect-ből ismert dispatchereknek. S aztán majd mobilon meglátjuk... Még az is lehet, hogy nem kell módosítani, mert bizonyos esetekben a mobil a tap során click eventeket is generál. Well, hát nem pont így lett, de erről később.

Szóval a letter üzen az eventekről, valahogyan így (ez tulajdonképpen a Letter butított változata, hogy a lényegre fókuszáljunk):
```javascript
export const Letter = ({ row, col, letter, handleMouseDown, handleMouseEnter }) => {
  return (
    <div onMouseDown={() => handleMouseDown([row, col])}>
      <span
        className={style.mouseEnterArea}
        onMouseEnter={() => handleMouseEnter([row, col])}>{letter}</span>
    </div>
  );
};
Letter.propTypes = {
  handleMouseDown: PropTypes.func,
  handleMouseEnter: PropTypes.func
};
```

Érdemes megfigyelni, hogy a mouseEnter event-et egy belső span-ről figyelem és nem a konténer div-ről. Ez azért van, mert akarok hagyni egy kis paddinget mozgási térként. Azaz hogy a mouseOver kicsit bentebbről érzékelődjön, lévén hogy a span kb a konténer 70%-át tölti ki, valahogyan így:

TODO!

Ez segít olyan esetekben, mikor a user a betűt a konténer sarkából próbája megközelíteni:

TODO!


Szóval a Board elkapja ezeket az eventeket, s ügyesen továbbítja az illetékeseknek (ugyancsak butított változat):
```javascript
export const Board = ({
  size, letters, selectedLetterCoords, enableSelectionMode, disableSelectionMode, handleLetterSelection 
}) => {
  return (
    <section
      className={classNames(style.board, style['board--' + size])}
      onMouseUp={disableSelectionMode}>
      {range(size).map(row =>
        range(size).map(col =>
          <Letter
            row={row}
            col={col}
            letter={letters[row * size + col]}
            key={`${row}_${col}`}
            selected={selectedLetterCoords.some(equalsCoord([row, col]))}
            handleMouseDown={enableSelectionMode}
            handleMouseEnter={(coord) => selectionMode && handleLetterSelection(coord)}
          />
        )
      )}
    </section>
  );
};
Board.propTypes = {
  size: PropTypes.number.isRequired,
  letters: PropTypes.array.isRequired,
  enableSelectionMode: PropTypes.func.isRequired,
  disableSelectionMode: PropTypes.func.isRequired,
  handleLetterSelection: PropTypes.func.isRequired
};

export default Board;
```

Az onMouseUp listenert formabontó módon nem a Letter komponensbe tettem, hanem a Board konténerére. Ez azért tűnt hasznosnak, mert így akkor is megszűnik a kiválasztó mód (selectionMode), ha a felhasználó pont a két Letter közötti hézagban engedi el az egeret.

Ez működött is, nem kis boldogsággal töltve el addigra már kissé megfáradt szívemet. Persze ez a pillanatnyi eufória füstként szállt el, mikor a mobilomon próbáltam pásztázni a betűk között. Nem történt semmi, az ég világon semmi. Pfajj ember, ennyit a mouse eventeket emuláló mobil böngészőkről. Nem is gondolhattam komolyan, hogy ez csak így cakk-pakk működni fog...

## Mobil optimalizálás elemi osztályos mértannal

Nos, vegyük elő a TouchEvent-eket, elvégre ezért vannak. Ott az `onTouchStart`, `onTouchEnd` és az `onTouchMove`. Ezek végülis analógiái az `onMouseUp`, `onMouseDown` és az `onMouseEnter` MoseEvent-eknek. Tehát azt okoskodtam, hogy ezeket odabiggyesztvén a megfelelő egeres listenerek mellé ugyanazt a hatást érem el. Háát, nagyjából. Egy kis gikszerrel: az onTouchMove **csakis** az onTouchStart-ot elindító DOM elemen érhető el. Azaz hiába csúsztatom az ujjam az első betűről a másodikra, az event csakis az első betűn kerül kibocsátásra. Tehát a második betűnek végig fogalma sincs, hogy éppen úgymond "hovereltem". Ez így nehezíti a dolgokat.

Csupán arra támaszkodhatok, hogy a touchMove event viewporton belül milyen x és y koordinátában bocsátódott ki. Pontosan ettől a matektől próbáltam megszabadulni, mikor mondjuk canvas helyett egyszerű DOM elemekként képzeltem el a boardot. Nos egye fene, meg kell írni a "házi feladatot". 

Először is tudnom kell mekkora a board. Szerencsémre itt a getBoundingClientRect() a megoldáshoz. Egyszerűen ref-elem a board konténert, meghívom a függvényt és eltárolom egy változóban.

```javascript
export const Board = ({ size, /* ... */ }) => {
  let boardBounds;
  /* ... */
  return (
    <section
      className={classNames(style.board, style['board--' + size])}
      ref={element => element && (boardBounds = element.getBoundingClientRect())}>
    </section>);
};
```

Eddig jó. Most kell egy függvény, ami megmondja koordináták alapján, hogy éppen melyik Letter-ben tartózkodom.
```javascript
const letterCoordByTouchPosition = (touch) => {
  const {clientX, clientY} = touch.targetTouches[0];
  const letterSize = boardBounds.width / size; // itt a size a board size-ja> 3, 4, ...
  const row = Math.floor((clientY - boardBounds.top) / letterSize);
  const col = Math.floor((clientX - boardBounds.left) / letterSize);
  return [row, col];
};
```

A gond csak annyi, hogy kellene mobilon is egy bizonyos padding a betűknek, azaz a touch event ne pontosan a betű szélénél kezdődjön, hanem kicsit bentebb. A toucholható négyzet pozícióját viszont meg tudom határozni, így azt is tudhatom, hogy a koordináta benne található-e:
```javascript
const letterTouchedInTouchArea = ([row, col], touch) => {
  const letterSize = boardBounds.width / size;
  const touchAreaPadding = 0.15 * letterSize;
  const area = {
    top: boardBounds.top + row * letterSize + touchAreaPadding,
    bottom: boardBounds.top + (row + 1) * letterSize - touchAreaPadding,
    left: boardBounds.left + col * letterSize + touchAreaPadding,
    right: boardBounds.left + (col + 1) * letterSize - touchAreaPadding
  };
    
  const {clientX, clientY} = touch.targetTouches[0];
  return clientX >= area.left
    && clientX <= area.right
    && clientY >= area.top
    && clientY <= area.bottom;
};
```

Már csak a ragasztó függvény hiányzik, amit aztán bátran hívhatok a touch-os event listenerekben:
```javascript
export const Board = ({ size, disableSelectionMode, handleLetterSelection, /* ... */ }) => {
  /* ... */
  const handleLetterTouch = (touch) => {
    const letterCoord = letterCoordByTouchPosition(touch);
    if (letterTouchedInTouchArea(letterCoord, touch)) {
      handleLetterSelection(letterCoord);
    }
  };
  
  return (
    <section
      className={classNames(style.board, style['board--' + size])}
      onTouchStart={handleLetterTouch}
      onTouchMove={handleLetterTouch}
      onTouchEnd={disableSelectionMode}>
    </section>);
};
```

**És kész! Woohoo, mobilon is működik a boardunk!**

## Utószó

Ez egy intenzív front-endes nap volt. Kis React, Redux, CSS, matek a végére. S messze még a vége. Ezek után már full-stack cuccok jönnek. Azt is megígérem, hogy a dolog megközelítése sem lesz éppen mindennapi. Leginkább a tech stack miatt nem.

Mikor lesz ebből multiplayer?! Ha kíváncsi vagy, kövesd tovább a folyamatot a [ferenc.rocks](https://www.facebook.com/ferenc.rocks/) facebook oldalamon.

És a legfontosabb: **hozzuk vissza a szórakozást a fejlesztésbe!** Addig is, balra el... 

## Linkek

A mai kód a GitHubon: 

Demó: 

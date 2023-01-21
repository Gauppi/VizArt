//Import Graph-Visualisierung
import { showGraph } from "./graph.js";

/////////////////////////////////////////////////
// Der Code macht eine PubMed-Abfrage zu einem bestimmten Suchterm (String) und erhält die Suchtreffer p in Form einer PMID-Liste zurück (ESearch+ESummary).
// Zu p wird eine iCite-Abfrage gemacht, um einerseits an die Gesamtheit aller eine Publikation in p zitierenden Publikationen z zu kommen, und andererseits bibliometrische Daten zu den Publikationen in p zu erhalten.
// Auch zu z wird eine iCite-Abfrage gemacht - um zählen zu können, wie oft die z-Publikationen gezählt werden (durch "z2"), und um bibliometrischen Daten zu den z-Publikationen zu erhalten.
//
//  p: Pubmed-Suchtreffer
//  z: p-Publikationen zitierende Publikationen
//  z2: z-Publikationen zitierende Publikationen
//
/////////////////////////////////////////////////

//////Listen für den späteren Gebrauch//////

//p-Publikationen und z-Publikationen
let pmids = []; // hochgeladene PubMed Artikel (PMID) Primärdatensatz
let revs = []; // hochgeladene Reviews (PMID) Primärdatensatz
let revList = []; // Mögliche Reviews von iCite -> Kriterium is_research_Article?  
let citedby = []; //Array von PMIDs: erster Teil enthält abwechslungsweise eine p-PMID und eine dazugehörige z-PMID (die aber nicht selber auch in p vorkommt), zweiter Teil enthält abwechslungsweise eine z-PMID und eine dazugehörige z2-PMID
let sekList = []; //..entspricht dem citedby-Arrays ohne dessen p-PMIDs - enthält nur dessen z- und z2-PMIDs

//Publikationen als Nodes definiert, und ihre Attribute
let nodes = []; //Array von Objekten mit je zwei named Properties: id: PMID, und group: "0" (sog. Research Article) oder "1" (nicht ein sog. Research Article: könnte Review sein)
let graphnodes = []; //Array von Objekten mit je zwei named Properties: id: PMID, data: Anzahl Referenzen auf diesen Artikel (Zitierungen)
let nodes_attributes = []; //Publikationen-Daten (bibliographische und bibliometrische) von iCite, als Knoten-Attribute: PMID, Titel, Autor, Journal-Name, ob 'primary research article' oder nicht, der RCR-Wert, die NIH-Perzentile und die Zitier-Häufigkeit
let attributes = [];  // Filter-Schlüssel zu nodes_attributes: Liste von Typen von Publikationen-Daten, die vom User ausgewählt wurden ("Filter")

//Zitierungs-Verbindungen (Edges) zwischen Publikationen (Nodes)
let directedlinks = []; //Array von Objekten mit je drei named Properties: Paar aus 1) 'source' und 2) 'target' (zwei p- oder zwei z-PMIDs, wobei 'source' das 'target' zitiert), sowie 3) unveränderlich 'type'=String: "CITATION"
let edges = []; // ..wie 'directedlinks', aber + 4. named Property 'value': relative citation ratio (RCR) des 'target'
let graphedges = []; // ..wie 'edges', aber + 5.&6. named Properties: 'id': fortlaufende Nr (=jeweiliger Wert vom Counter cit_count), data: key-Objekt String "e1"

//Counter-Variablen für Zitierungen (citations) und Reviews
let cit_count = 0; //Counter für die Anzahl gefundener Zitierungen (p-p-, z-p-, z-z- und z2-z-Zitierungen)
let rev_count = 0; //Counter für in p oder z gefundene sog. 'primary research articles' (Definition/Auflistung: vgl. https://icite.od.nih.gov/user_guide?page_id=ug_data#article)
let art_cites_rev_count = 0; // Counter der Artikel, die ein Review zitieren
let pubMed_found = 0; // Anzahl der in der PubMed-Suche gefundenen Artikel

/**
 * @name searchFileorText - entscheidet, ob die Datei oder der Suchbegriff verwendet wird. Endet mit der Suchfunktion resp. Lade... Funktion.
 */
export function searchFileorText() {
    document.querySelector('#btnsendquery').disabled = true;
    init();
    if (document.getElementById("fileToLoad").files.length == 0) {
        search(document.getElementById('searchquery').innerHTML = document.getElementById('sterm').value.toString());
    }
    if (document.getElementById("fileToLoadReview").files.length != 0) {
        loadReview();
    }
    if (document.getElementById("fileToLoad").files.length != 0) {
        loadPmidTxtOrCsv();
    } 
}

/**
 * @name search - 
 * @param {string} query - PubMed-Suchstring, entweder PMID-Liste (aus hochgeladenem .csv) oder Suchbegriffe-Term (entsprechend dem im Suchfeld eingegebenen Text)
 */
export async function search(query) {

    try {
        let data;
        let viz = true;
        //Benutzerinteraktionen abfangen
        if ((query == "Suchbegriffe" || query == "") && document.getElementById("fileToLoadReview").files.length == 1) {
            alert("Bitte laden Sie noch den gesamten Datensatz hoch -> 1. Feld!")
        }
        else if (query == "" || query == "Suchbegriffe") {
            alert("Bitte geben Sie einen Suchebegriff ein oder laden Sie eine Datei von PubMed hoch!");
            document.querySelector('#btnsendquery').disabled = false;
        }
        else {
            document.getElementById("loader").style.display = "inline";
            let data;
            let pubMedDocSums;
            if (!(query instanceof Array)) {
                let pubMedSearch = await searchPubMed(query);
                pubMed_found = pubMedSearch.esearchresult.count;
                document.getElementById("pubart").innerHTML = "PubMed Artikel gefunden: " + pubMed_found.toLocaleString('de-CH');
                document.getElementById("sterm").value = "";
                if(pubMed_found > 500){
                    alert("Es wurden mehr als 500 Artikel gefunden. Bitte laden Sie das CSV dieser Suche auf PubMed herunter und starten Sie die Suche erneut mittels FileUpload.");
                    const nres = document.getElementById("legende");
                    nres.textContent = "Kennzahlen zu den ersten 500 Artikel";
                    viz = false;
                }
                pubMedDocSums = await retrieveDocSum(pubMedSearch);
                let pmidquery = displayDocSum(pubMedDocSums);
                // Metadaten zu den PMIDs (JSON-Objekt) der p-Publikationen suchen, inklusive Liste der die p-Publikationen zitierenden Publikaitonen z; sekList und citedby werden befüllt
                let iCiteData = await getICiteData(pmidquery.toString());
                // Metadaten zu den z-Publikationen suchen, inklusive Liste der die z-Publikaitonen zitierenden Publikationen z2; sekList und citedby werden weiter befüllt
                let iCiteData2 = await getICiteData2(sekList);
                // Zitationsdaten zusammenführen
                data = combineData(iCiteData, iCiteData2);
            }
            else {
                if(pmids < 100){
                    alert("Kleine Datensätze werden auf der Webseite nicht dargestellt. Dafür kann das Ergebnis heruntergeladen werden.");
                    viz = false;
                }
                const nres = document.getElementById("nresultsPubArt");
                pubMed_found = pmids.length;
                nres.innerHTML = pubMed_found.toLocaleString('de-CH') + " PubMed-Artikel <em>p</em> gefunden";
                document.getElementById("pubart").innerHTML = "Liste der " + pubMed_found.toLocaleString('de-CH') + " PubMed-Artikel:";
                let iCiteData;
                // Metadaten zu den PMIDs (JSON-Objekt) der p-Publikationen suchen, inklusive Liste der die p-Publikationen zitierenden Publikaitonen z; sekList und citedby werden befüllt
                if (pubMed_found > 1000) {
                    iCiteData += await getICiteData2(pmids)  // Aufteilen der Query in 1000er Pakete, die dann einzelnen an iCite versendet werden
                }
                else {
                    iCiteData = await getICiteData(pmids);
                }
                // Metadaten zu den z-Publikationen suchen, inklusive Liste der die z-Publikaitonen zitierenden Publikationen z2; sekList und citedby werden weiter befüllt
                let iCiteData2 = await getICiteData2(sekList);
                // Zitationsdaten zusammenführen
                data = combineData(iCiteData, iCiteData2);
            }
            //Resultat updaten Zitationen hinzufügen
            displayResCount();
            //Loading Animation hide
            document.getElementById("loader").style.display = "none";
            let x = document.getElementById("divOutput");
            x.style.display = "block";
            //Erstellen des force directed Graphes
            data = combineData(nodes, edges);
            if (pubMed_found > 100 && pubMed_found <= 1000 && viz == true) {
                showGraph(data);
            }
            //Zurücksetzten der hochgeladenen Dateien
            document.getElementById("fileToLoad").value = "";
            document.getElementById("fileToLoadReview").value = "";
            //Daten auf GraphML umformatieren mit den Artikel als Knoten, Zitierungen als Verbindungen und weiteren Attributen, die aus der Filter Liste ausgewählt werden können
            data = createGRAPHML(graphnodes, graphedges, attributes, nodes_attributes)
            saveData();
            document.querySelector('#btnsendquery').disabled = false;
        }
    } catch (e) {
        console.log(e)
    }
}

/**
 * @name init - setzt Variabeln zurück und bereitet die Webseite vor
 */
function init() {
    //Counters und Arrays zurücksetzen 
    pmids = [];
    revs = [];
    revList = [];
    citedby = []; 
    sekList = []; 

    nodes = []; 
    graphnodes = []; 
    nodes_attributes = []; 
    attributes = [];  

    directedlinks = []; 
    edges = []; 
    graphedges = []; 

    cit_count = 0;
    rev_count = 0; 
    art_cites_rev_count = 0; 
}


// Für eine Suchterm-Eingabe in das Suchfeld von VizArt wird folgende Daten-Pipeline aus einzelnen E-Utilities der NLM benützt:
// ESearch      >   ESummary
// Damit wird die PubMed-Suche gemacht. Es resultieren die bibliographischen Angaben zu den gefundenen Artikeln.
// Die entsprechende Pipeline aus JavaScript-Funktionen lautet:
// searchPubMed >   retrieveDocSum
// Die Pipeline geht jedoch noch weiter:
// searchPubMed >   retrieveDocSum  >   displayDocSum   >   getICiteData    >   combineData
//
// Für das Hochladen einer CSV-Datei, welche PubMed-Suchresultate enthält (nur PMIDs, nicht ganzer bibliographiescher Datensatz), ist die o.g. 2-Elemente-Pipeline aus E-Utilities nicht nötig. Es bleibt nur der Rest:
//      PMIDs in CSV-Datei                              >   getICiteData    >   combineData


/**
 * @name searchPubMed - makes a PubMed search (ESearch) with the search term searchString, and returns the received PubMed ESearch result (JSON)
 * @param {JSON} searchString - search term (string) as it could be entered into the search field on the PubMed website
 * @returns {JSON} - PubMed ESearch result im JSON-Format
 */
async function searchPubMed(searchString) {
    // sucht (mittels ESearch) in PubMed nach 'searchString', schreibt das Resultat in die Console und die Suchtreffer-Anzahl in die globale Variable und ins HTML, und gibt das Suchresultat als JSON zurück.
    //nutzt die jQuery ajax get()-Funktion um einen asynchronen HTTP GET Request an den eutils-Server zu machen
    let data = await $.ajax({
        type: 'GET',

        //baut die ESearch-URL zusammen
        url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
        data: {
            db: 'pubmed', //wählt aus den Entrez-Ressourcen die Datenbank PubMed aus
            usehistory: 'y', //"y(es)", so dass das Resultat auf dem 'History'-Server von E-Utilities gespeichert wird, damit es dann von ESummary verwendet werden kann. (Nebenbei liefert so das ESearch-Resultat auch die Information 'count' (=Anzahl Treffer).)
            term: searchString, //Als Such-Term wird das dieser Methode mitgegebene Argument searchString verwendet
            retmode: 'json', //Festlegung des retrieval mode (=Rückgabe-Format) auf JSON (statt Standard XML)
            retmax: 500 //Heraufsetzen der max. Anzahl von PMIDs in der Rückgabe (von Standard 20)
        }
    });
    document.getElementById("searchquery").textContent = 'Suchbegriff: ' + data.esearchresult.querytranslation;
    //Speichert die Suchtreffer-Anzahl in die entsprechende globale Variable
    //schreibt ins HTML, an der Stelle nresultsPubArt, die wievielte Suche/Resultat wieviele Treffer gegeben hat: "x. Resultat: xyz Artikel gefunden:"
    const nres = document.getElementById("nresultsPubArt");
    nres.textContent = data.esearchresult.count.toString() + " PubMed-Artikel gefunden";
    //gibt das Resultat von ESearch zurück
    return data;
}

/**
 * @name retrieveDocSum - ruft zum PubMed ESearch result  das entsprechende PubMed ESummary result ("Document Summary")
 * @param {JSON} searchResponse - PubMed ESearch result (PMIDs; im JSON-Format)
 * @returns {JSON} PubMed ESummary result ("Document Summary": enthält nebst den PMIDs der gefundenen Artikel auch deren Erscheinungsdatum, Titel, Autoren usw.; JSON-Format)
 */
async function retrieveDocSum(searchResponse) {
    //Ruft (mittels ESummary) zu jeder PMID in den Suchtreffern das Document Summary ab.
    //nutzt die jQuery ajax get()-Funktion um einen asynchronen HTTP GET Request an den eutils-Server zu machen
    let data = await $.ajax({
        type: 'GET',

        //Loop Anfrage 
        //baut die ESummary-URL zusammen
        url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi',
        data: {
            db: 'pubmed', //wählt aus den Entrez-Ressourcen die Datenbank PubMed aus
            usehistory: 'y', 
            webenv: searchResponse.esearchresult.webenv, //Statt mit 'id: searchResponse.esearchresult.idlist': die UIDs werden vom History Server geholt
            query_key: searchResponse.esearchresult.querykey, //gehört zu webenv dazu
            retmode: 'json', //Festlegung des retrieval mode (=Rückgabe-Format) auf JSON (statt Standard XML)
            retmax: 500 //Heraufsetzen der max. Anzahl von PMIDs in der Rückgabe (von Standard 20)
        }
    });
    //gibt das Resultat von ESummary an den Caller der Funktion zurück
    return data;
}

/**
 * @name displayDocSum - Zeigt die interessierenden Inhalte der Document Summaries im HTML an und befüllt die globale pmidList mit den PMIDs.
 * @param {JSON} PubMedData - PubMed ESummary result ("Document Summary": enthält nebst den PMIDs der gefundenen Artikel auch deren Erscheinungsdatum, Titel, Autoren usw.; JSON-Format)
 */
function displayDocSum(pubMedData) {

    let output = $('#output'); //weist der variable 'output' das HTML-Element mit id="output" zu.
    let pmidList = [];         // List mit den gesammelten PubMed IDs (PMID)
    $.each(pubMedData.result, function (i, article) { 
        //fügt der globalen pmidList die article.uid des jetzigen pubMedData.result (=der jetzigen Publikation) hinzu
        pmidList.push(article.uid);
        pmids.push(article.uid);
        let item = $('<li/>').appendTo(output);
        let container = $('<div/>').appendTo(item);
        //Publikationsdatum und Journalname
        $('<p/>', {
            text: article.pubdate + " | " + article.fulljournalname
        }).appendTo(item);
        //PMID +Titel + Link zum Artikel
        $('<a/>', {
            href: "https://pubmed.ncbi.nlm.nih.gov/" + article.uid,
            text: i + 1 + ". |" + article.uid + " | " + article.title,
        }).appendTo(container);
        ////Konvertiert den Namen jedes Autors (JS-Objekt) der jetzigen Publikation in einen JSON-String, und konketeniert fortlaufend zu einem einzigen JSON-String für die jetzige Publikation
        $('<p/>', {
            text: JSON.stringify(article.authors) //macht ein HTML-Element 'text', das die in einen JSON-String konvertierte Autorenliste (JS-Objekt?) der jetzigen Publikation enthält
        }).appendTo(item); //fügt das text-Element dem 'item'-Element hinzu
        //Trennlinie nach jeder Publikation
        $('<hr width="98%" align="center" height="25px" background-color="blue">').appendTo(item);
    });
    //entfernen des letzten Eintrags (undefined)
    pmids.pop();
    pmidList.pop();
    return pmidList;
}

/**
 * @name getICiteData
 * @param {list} pmidList - List of PubMed IDs (primary search result) 
 * @returns {JSON} data - iCite respond (further information to the existing articles)
 */
async function getICiteData(pmidList) {
    // für das die PMID-Liste (JSON-Objekt; p- oder z-Publikationen) pmidList wird eine iCite-Anfrage gemacht um jede PMID (bzw. die dazugehörigen Metadaten) korrekt in die Listen nodes, graphnodes und nodes_attributes einzutragen; der rev_count wird ggf. erhöht.
    //(=pmidList)
    //Für den Suchterm 'query'=pmidList wird die jQuery ajax get()-Funktion genutzt um einen asynchronen HTTP GET Request an den icite-Server gemacht
    let query = pmidList.toString();
    let data = await $.ajax({
        method: "GET",
        url: "https://icite.od.nih.gov/api/pubs?pmids=" + pmidList,

    })
    //gibt alle PMIDs (genannt 'article'), für die die iCite-Abfrage gemacht wurden (=pmidList), in der Konsole aus, und loopt durch sie hindurch
    //console.log("getICiteData", data.data);

    data.data.forEach(article => {
        
        //Sonderzeichen in iCite-Resultaten ersetzen:
        // Für jeden article im iCite-Resultat wird in den Strings
        //  authors
        //  journal
        // ein nicht lesbares Sonderzeichen durch seinen ASCII-Code (dezimale numerische HTML-Notation) ersetzt:
        //  "&"    ->  "&#38;"
        article.authors = article.authors.replace(/&/g, "&#38;");
        article.journal = article.journal.replace(/&/g, "&#38;");

        //Wenn ein PDMI nicht unter den hochgeladenen Reviews ist, wird der rev_count hochgezählt und es wird in die revList aufgenommen und als Knoten der Gruppe 1 (orange) in (graph)nodes hinzugefügt
        if (revs.includes(article.pmid)) {
            rev_count++;
            revList.push(article.pmid);
            nodes.push({ id: article.pmid, group: "1", citation_count: article.cited_by.length , review: "Review"}); //Gruppe "1" wird im Graphen orange hervorgehoben
            graphnodes.push({ id: article.pmid, data: article.cited_by.length });
        }
        //Die jetzige PMID wird den 'nodes' hinzugefügt mit Property 'id'=PMID und..
        //..wenn die PMID für einen sog. 'primary research article' steht (Definition/Auflistung: vgl. https://icite.od.nih.gov/user_guide?page_id=ug_data#article) mit Property 'group'=0, ..
        else if (article.is_research_article == "Yes") {
            nodes.push({ id: article.pmid, group: "0", citation_count: article.cited_by.length, review: "research Article" });
            //..und in beiden Fällen wird auch den 'graphnodes' die PMID als 'id' hinzugefügt, plus ein Objekt 'data'='key':"n1"..
            graphnodes.push({ id: article.pmid, data: article.cited_by.length });
        }
        //..wenn die PMID nicht für einen sog. 'primary research article' könnte es sich dabei um ein Review handeln: das Property 'group' ist 1 (dient dem farblich Hervorheben im Graphen) und der revCount wird hochgezählt und die PMID in der Konsole ausgegeben..
        else if (!(revs.includes(article.pmid))) {
            rev_count++;    //potentielles Review found => Counter hochzählen
            revList.push(article.pmid); //Review in globale Liste speichern
            nodes.push({ id: article.pmid, group: "2", citation_count: article.cited_by.length, review: "not research Article" }); //Gruppe "2" Grün
            graphnodes.push({ id: article.pmid, data: article.cited_by.length});
        }
        //..und den 'nodes_attributes' weitere Daten als Attribute (Aufzählung: vgl. hier oder in Variablen-Definition)
        nodes_attributes.push({ pmid: article.pmid, authors: article.authors, journal: article.journal, is_res_article: article.is_research_article, rcr: article.relative_citation_ratio, nih: article.nih_percentile, cit_count: article.citation_count, animal: article.animal, expcit: article.expected_citations_per_year, fieldcit: article.field_citation_rate, citedbyclin: article.cited_by_clin, citedby: article.cited_by, refs: article.references });
        //nun werden auch noch die die Publikationen in pmidList (p- oder z-Publikaitonen) zitierenden (z- bzw. z2-)Publikationen untersucht.
        //sofern die Liste der z-p- bzw. z2-z-Zitierungen nicht leer ist, wird durch sie durchgeloopt, und jede z- bzw. z2-Publikation wird untersucht
        if (article.cited_by.length != 0) {
            for (let j = 0; j < article.cited_by.length; j++) {
                //Sofern diese z- bzw. z2-Publikation keine unbekannte/"undefined" PMID hat, wird sie näher untersucht
                if (article.cited_by[j] != undefined) {
                    //falls ein Artikel ein Review aus der Primärliste zitiert: Counter hoch zählen
                    if (revs.includes(article.cited_by[j]) || revList.includes(article.cited_by[j])) {
                        art_cites_rev_count++;
                    }
                    //falls die PMID dieser z- bzw. z2-Publikation bereits in p bzw. z drin ist (=in pmidList), handelt es sich um eine p-p- bzw. z-z-Zitierung und die Verbindungen werden in die Arrays directeslinks, edges und graphedges aufgenommen...
                    if (pmids.includes(article.cited_by[j].toString()) || pmids.includes(article.cited_by[j])) {
                        //für die Erläuterung dieser drei Arrays: vgl. Kommentare bei deren Instanzierung am Code-Anfang
                        directedlinks.push({ source: article.cited_by[j], target: article.pmid, type: "CITATION" });
                        edges.push({ target: article.pmid, source: article.cited_by[j], value: article.relative_citation_ratio, type: "CITATION" });
                        graphedges.push({ id: article.pmid, source: article.cited_by[j],  target: article.pmid, value: article.relative_citation_ratio, type: "CITATION", data: { key: "e1" } });
                    }
                    else if (pmidList.includes(article.cited_by[j])) {
                        edges.push({ target: article.pmid, source: article.cited_by[j], value: article.relative_citation_ratio, type: "CITATION" });
                        graphedges.push({ id: article.pmid, source: article.cited_by[j],  target: article.pmid, value: article.relative_citation_ratio, type: "CITATION", data: { key: "e1" } });
                    }
                    //..andernfalls werden sie in die Arrays citedby und sekList aufgenommen
                    else if (sekList.indexOf(article.cited_by[j]) == -1 && pmids.indexOf(article.cited_by[j]) == -1) {
                        //nodes.push({id :  article.cited_by[i], group: "5"}); //Diese Zeile entkommentieren, falls sämtliche z- und z2-Publikationen ebenfalls im GraphML erscheinen sollen
                        citedby.push(article.pmid, article.cited_by[j]); //z-p-Zitierung kommt in die entsprechende globale Liste
                        cit_count++; //zählt den globalen Counter für gefundene Zitierungen hoch
                        sekList.push(article.cited_by[j]);  //z-Publikation kommt in die entsprechende globale Liste
                    }
                }
            }
        }
    });
    return data;
}

/**
 * @name getICiteData2
 * @param {list} idlist - List of IDs (cited_by articles form primary search result)
 * @returns {JSON} data - iCite respond (further information to the existing articles cited by the primary search) 
 */
async function getICiteData2(idlist) {
    //2. Suche auf iCite mit den zitierenden Artikel aus der ersten Suche. macht eine iCite-Abfrage zu den PMIDs im Array idlist; 1000 Pakete 
    let data;
    let maxLength = 1000;
    try {
        if (idlist.length > maxLength) {
            let subquery = sliceIntoChunks(idlist, maxLength);
            for (let i = 0; i < subquery.length; i++) {
                data = await getICiteData(subquery[i]);
            }
            return data;
        }
        else {
            data = await getICiteData(idlist);
            return data;
        }

    }
    catch (e) {
    }
}

/**
 * @name sliceIntoChunks
 * @param {Array} arr - die Tabelle mit den zu verkleinernden Daten 
 * @param {int} chunkSize - Päckchen Grösse
 * @returns {Array} res - Array of each chunk
 */
function sliceIntoChunks(arr, chunkSize) {
    // teilt ein Array arr in Stücke der Grösse chunkSize auf und gibt sie in ein gemeinsames übergeordnetes Array verpackt zurück. (z.B.: arr hat Länge 100, chunkSize=20 -> return-Wert ist ein Array, das 5 20er-Arrays enthält).
    const res = [];
    const fullChunks = Math.floor(arr.length / chunkSize);
    for (let i = 0; i < fullChunks; i++) {
        const chunk = arr.slice(i * chunkSize, (i + 1) * chunkSize);
        res.push(chunk);
    }
    if (arr.length % chunkSize != 0) {
        let lastChunk = arr.slice(fullChunks * chunkSize, arr.length)
        res.push(lastChunk)
    }
    return res;
}

/**
 * @name displayResCount - Gesamtmenge an Artikeln, Zitationen und Reviews anzeigen. Zusätzlich interpretation der Werte  
 */
function displayResCount() {

    for (let i = 0; i < citedby.length; i++) {
        if (revList.includes[citedby[i]] || revs.includes[citedby[i]]) {
            art_cites_rev_count++;
        }
    }
    const nreszit = document.getElementById("nresultsZit");
    nreszit.insertAdjacentHTML("afterbegin","Zitierungen der <span style='color: #5E5DF0'><em>p</em></span>-Artikel: <span style='color: #5E5DF0'>" + directedlinks.length.toLocaleString('de-CH') + "</span>");
    nreszit.insertAdjacentHTML("afterbegin","<span style='color: #5E5DF0'><em>p</em></span> zitierende Artikel <span style='color: #65D7FF'><em>z</em></span>: <span style='color: #65D7FF'>" + (nodes.length - pubMed_found).toLocaleString('de-CH') + "</span><br/>");
    nreszit.insertAdjacentHTML("beforeend","<br>Zitierungen der <span style='color: #65D7FF'><em>z</em></span>-Artikel : <span style='color: #65D7FF'>" + cit_count.toLocaleString('de-CH') + "</span><br/>");
    const nreszit_tooltip = document.getElementById("arrow_results");
    nreszit_tooltip.innerHTML = "&#9432";
    
    const nresgraph = document.getElementById("nresultsgraph");
    nresgraph.textContent = "Knoten: " + nodes.length.toLocaleString('de-CH') + " | Kanten: " + edges.length.toLocaleString('de-CH');
    const nresRev = document.getElementById("nresultsRev");
    nresRev.textContent = " Mögliche Reviews: " + rev_count.toLocaleString('de-CH') + " (mit " + art_cites_rev_count.toLocaleString('de-CH') + " Zitierungen)\n";
    
    //Interpretation einfügen 
    const interpret = document.getElementById("interpretation");
    // WENN(Wie hoch ist der Prozentsatz der Artikel, die von einem Review zitiert werden? < 10%)
    if ((art_cites_rev_count / cit_count) > 0.1) {
        interpret.innerHTML = "Dieses Gebiet scheint bereits gut in Reviews zusammengefasst zu sein.<br/>Empfehlung: anderes Gebiet finden.)";
    }
    else {
        interpret.innerHTML = "In diesem Gebiet könnte es sich lohnen, eine weitere Analyse vorzunehmen.<br/>(Empfehlung: Resultat exportieren!)";
    }
}

/**
 * @name combineData - Create a dataobject for the found nodes and edges to create a graph
 * @returns {object} data - object combined of nodes and edges
 */
function combineData() {
    const data = {
        nodes: nodes,
        edges: edges
    }
    return data
}

/**
* @name createGRAPHML
* @param {object} nodes - Knoten (Artikel) 
* @param {object} edges - Kanten (Zitation) 
* @param {object} attributes - Attributen als Schlüssel 
* @param {object} nodes_attributes - Zusatzinformationen zu den Artikel 
* @returns {string} output string - graphML Syntax 
*/
function createGRAPHML(nodes, edges, attributes, nodes_attributes) {
    let keystring = "";
    let nodestring = "";
    let edgestring = "";
    let attributesTypes = ["int", "string", "string", "string", "double", "double", "int", "int", "float", "float", "string", "string", "string"];
    if (attributes.length > 0) {
        for (let i = 0; i < attributes.length; i++) {
            let key_attribute = attributes.at(i);
            switch(key_attribute){
                case "PMID":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[0] + '"> </key>\n';
                    break;
                case "Authors":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[1] + '"> </key>\n';
                    break;
                case "Journal":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[2] + '"> </key>\n';
                    break;
                case "is_research_article":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[3] + '"> </key>\n';
                    break;
                case "relative_citation_ratio":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[4] + '"> </key>\n';
                    break;
                case "nih_percentile":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[5] + '"> </key>\n';
                    break;
                case "animal":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[6] + '"> </key>\n';
                    break;
                case "citation_count":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[7] + '"> </key>\n';
                    break;
                case "expected_citation_per_year":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[8] + '"> </key>\n';
                    break;
                case "field_citation_rate":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[9] + '"> </key>\n';
                    break;
                case "cited_by_clin":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[10] + '"> </key>\n';
                    break;
                case "cited_by":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[11] + '"> </key>\n';
                    break;
                case "references":
                    keystring += '<key id="' + attributes[i] + '" for="node" attr.name="' + attributes[i] + '" attr.type="' + attributesTypes[12] + '"> </key>\n';
                    break;
            }
        }
    }


    for (let i = 0; i < nodes.length; i++) {
        nodestring += '<node id="' + nodes[i].id + '">\n' +
            '<data key="n1">' + nodes[i].review + '</data>\n';

        for (let j = 0; j < attributes.length; j++) {
            let _attributes = attributes.at(j);
            switch (_attributes) {
                case "PMID":
                    nodestring += '<data key="' + attributes[j] + '">' + nodes_attributes[i].pmid + '</data>' + "\n";
                    break;
                case "Authors":
                    nodestring += '<data key="' + attributes[j] + '">' + nodes_attributes[i].authors + '</data>' + "\n";
                    break;
                case "Journal":
                    nodestring += '<data key="' + attributes[j] + '">' + nodes_attributes[i].journal + '</data>' + "\n";
                    break;
                case "is_research_article":
                    nodestring += '<data key="' + attributes[j] + '">' + nodes_attributes[i].is_res_article + '</data>' + "\n";
                    break;
                case "relative_citation_ratio":
                    nodestring += '<data key="' + attributes[j] + '">' + parseFloat(nodes_attributes[i].rcr) + '</data>' + "\n";
                    break;
                case "nih_percentile":
                    nodestring += '<data key="' + attributes[j] + '">' + parseFloat(nodes_attributes[i].nih) + '</data>' + "\n";
                    break;
                case "animal":
                    nodestring += '<data key="' + attributes[j] + '">' + parseInt(nodes_attributes[i].animal) + '</data>' + "\n";
                    break;
                case "citation_count":
                    nodestring += '<data key="' + attributes[j] + '">' + parseInt(nodes_attributes[i].cit_count) + '</data>' + "\n";
                    break;
                case "expected_citation_per_year":
                    nodestring += '<data key="' + attributes[j] + '">' + parseFloat(nodes_attributes[i].expcit) + '</data>' + "\n";
                    break;
                case "field_citation_rate":
                    nodestring += '<data key="' + attributes[j] + '">' + parseFloat(nodes_attributes[i].fieldcit) + '</data>' + "\n";
                    break;
                case "cited_by_clin":
                    nodestring += '<data key="' + attributes[j] + '">' + nodes_attributes[i].citedbyclin + '</data>' + "\n";
                    break;
                case "cited_by":
                    nodestring += '<data key="' + attributes[j] + '">' + nodes_attributes[i].citedby + '</data>' + "\n";
                    break;
                case "references":
                    nodestring += '<data key="' + attributes[j] + '">' + nodes_attributes[i].refs.toString() + '</data>' + "\n";
                    break;
            }
        }
        nodestring += '</node>\n'
    }

    for (let i = 0; i < edges.length; i++) {
        edgestring += '<edge source="' + edges[i].source + '"' + ' target="' + edges[i].target + '">\n' +
            '<data key="e1">' + Math.round(edges[i].value) + '</data>\n' +
            '</edge>\n'
    }

    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n' +
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
        'xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n' +
        'http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n' +
        '<key id="e1" for="edge" attr.name="cites" attr.type="double">\n' +
        '<default>1</default></key>\n' +
        keystring + '\n' +
        '<key id="n1" for="node" attr.name="Article-Type" attr.type="string">\n' +
        '<default>1</default></key>\n' +
        '<graph edgedefault="directed">\n' +
        nodestring + "\n" + "\n" + edgestring + '\n' +
        '</graph></graphml>';
}

/**
 * @name loadPmidTxtOrCsv - lädt die ausgewählte Datei (.txt oder .csv) in die App, und startet die Pubmed-Suche mit ihrem Inhalt als Suchterm
 */
function loadPmidTxtOrCsv() {
    //schreibt die ausgewählte Datei ("file") in die Variable fileToLoad
    let fileToLoad = document.getElementById("fileToLoad").files[0];
    //Instanziierung eines FileReader-Objekts in der Variable fileReader
    let fileReader = new FileReader();
    document.getElementById("btnreset").style.visibility = "visible";
    let pubMedAdvancedSearchQuery = "";

    let pmidList = [];
    let titleList = [];

    let fileName = document.querySelector("#fileToLoad").value;
    let extension = fileName.split('.').pop();

    //definiert, was beim Benützen (->triggert "onload") des FileReader-Objekts fileReader passieren soll.
    fileReader.onload = function (fileLoadedEvent) {
        let textFromFileLoaded = fileLoadedEvent.target.result;
        let loadedTypeContains = "Datei enthält";
        if (extension == "csv") {
            let lbreak = textFromFileLoaded.split("\n");
            textFromFileLoaded = "";
            lbreak.shift(); //removes first element in array lbreak, i.e., the column headers
            lbreak.forEach(res => {
                let pmid = parseInt(res.split(",")[0].replace(/"/g, ""))
                if (pmid) {
                    pmidList.push(pmid);
                    //Globale Liste
                    pmids.push(pmid.toString());
                }
                let title = res.split(",")[1];
                if (title) {
                    titleList.push(title);
                }
                textFromFileLoaded = textFromFileLoaded + ' ' + res.split(",")[0]; //keeps only the first element of each element in array lbrek, i.e., the PMID Column
            });
            textFromFileLoaded = textFromFileLoaded.slice(1);
            loadedTypeContains = "CSV-" + loadedTypeContains + " folgende PMIDs";
        } 
        //search-Funktion aus script.js mit dem Inhalt der hochgeladenen Datei als Suchterm aufrufen
        pubMedAdvancedSearchQuery = fileToLoad.name;
        for (let i = 0; i < pmidList.length; i++) {
            //fügt dem HTML-Element output ein Listen-Element hinzu, das 'item' genannt wird, und diesem wiederum ein div-Element 'container'. Befüllt diese folgenden Daten der jetzigen Publikation: Publikationsdatum und Journalname resp. PMID, Titel und Link auf PubMed
            let item = $('<li/>').appendTo(output);
            let container = $('<div/>').appendTo(item);
            //PMID +Titel + Link zum Artikel
            $('<a/>', {
                href: "https://pubmed.ncbi.nlm.nih.gov/" + pmidList[i],
                text: i + 1 + ". |" + pmidList[i] + " | " + titleList[i],
            }).appendTo(container);
            //Trennlinie nach jeder Publikation
            $('<hr width="98%" align="center" height="25px" background-color="blue">').appendTo(item);
        }
        document.getElementById("btnreset").style.visibility = "visible";
        document.getElementById("searchquery").textContent = pubMedAdvancedSearchQuery;
        search(pmidList); 

    };
    if (extension == "csv") {
        fileReader.readAsBinaryString(fileToLoad);
    } else {
        alert("Bitte wählen Sie ein .csv aus.");
    }
}

/**
 * @name loadReview - optionaler FileUpload, lädt die ausgewählte Datei (.txt oder .csv) in die App, um Reviews in der Primärliste zu identifizieren
 */
function loadReview() {
    //schreibt die ausgewählte Datei ("file") in die Variable fileToLoad
    let fileToLoad = document.getElementById("fileToLoadReview").files[0];
    document.getElementById("btnresetRev").style.visibility = "visible";
    let pubMedAdvancedSearchQuery = "";

    //Instanziierung eines FileReader-Objekts in der Variable fileReader
    let fileReader = new FileReader();

    let revList = [];

    let fileName = document.querySelector("#fileToLoad").value;
    let extension = fileName.split('.').pop();

    //definiert, was beim Benützen (->triggert "onload") des FileReader-Objekts fileReader passieren soll.
    fileReader.onload = function (fileLoadedEvent) {
        let textFromFileLoaded = fileLoadedEvent.target.result;
        let loadedTypeContains = "Datei enthält";
        if (extension == "csv") {
            let lbreak = textFromFileLoaded.split("\n");
            textFromFileLoaded = "";
            lbreak.shift(); //removes first element in array lbreak, i.e., the column headers
            lbreak.forEach(res => {
                let pmid = parseInt(res.split(",")[0].replace(/"/g, ""))
                if (pmid) {
                    rev_count++;
                    revList.push(pmid);
                    //Globale Variabel
                    revs.push(pmid);
                }
                textFromFileLoaded = textFromFileLoaded + ' ' + res.split(",")[0]; //keeps only the first element of each element in array lbrek, i.e., the PMID Column
            });
            textFromFileLoaded = textFromFileLoaded.slice(1);
            loadedTypeContains = "CSV-" + loadedTypeContains + " folgende Reviews";
        }         
        pubMedAdvancedSearchQuery = fileToLoad.name;
    };

    if (extension == "csv") {
        fileReader.readAsBinaryString(fileToLoad);
    } else {
        alert("Bitte wählen Sie ein .txt oder ein .csv aus.");
    }
}

/**
* @name saveData - 
*/
export function saveData() {
    let data = createGRAPHML(nodes, graphedges, attributes, nodes_attributes);
    const a1 = document.getElementById("a1");
    const file = new Blob([data], { type: "text/plain" })
    a1.href = URL.createObjectURL(file);
}

/**
* @name setAttributes - Schaut im HTML nach, welche Attribut-Typen ausgewählt sind, schreibt sie in die globale Variable (Array) 'attributes' und gibt sie auch als Return-Wert zurück
*/
export function setAttributes() {
    let selected = [];
    attributes = [];
    $('.filters__list input:checked').each(function () {
        selected.push($(this).val());
        attributes.push($(this).val());
    });
    document.getElementById("filter-container").classList.remove('filters--active');
    
    //Export result über einen Link
    saveData();
    return selected;
}
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://gitlab.ti.bfh.ch/gaupa1/revieWanted">
    <img src="images/logo.png" alt="Logo" width="300" height="100">
  </a>

  <h3 align="center">revieWanted</h3>

  <p align="center">
    Suche nach reviewbedürftigen Themengebieten
    <br />
    <a href="https://gitlab.ti.bfh.ch/gaupa1/revieWanted"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://gitlab.ti.bfh.ch/gaupa1/revieWanted">View Demo</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">Über das Projekt</a>
      <ul>
        <li><a href="#built-with">Entwickelt mit</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Voraussetzungen</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Nutzung</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">Lizenz</a></li>
    <li><a href="#contact">Kontakt</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## Über das Projekt
![RevieWanted DemoView][DemoView]
[![RevieWanted Screenshot][product-screenshot]](https://example.com)


**VizArt** ist eine Webseite die es Forschern und gesundheitsfachpersonen ermöglicht Publikationsdaten für eine SNA aufzubereiten. Hierbei werden Publikationsdaten aus PubMed und Zitationsmerkmale aus iCite extrahiert und zusammengeführt. Dieses Projekt beschäftigt sich mit der Aufgabe zu einem vorgegebenen Input, sämtliche Pubmed-Artikel und deren Ziationsmerkmale zu extrahieren und in ein geeignetes Graph-Format zu exportieren. Im Rahmen dieser Arbeit wird für die Datenquellen PubMed und iCite verwendet. Grund dafür sind die bereitgestellten Schnittstellen zur Extraktion der Daten.

Was macht die Webseite:
* Sammeln aller gefundenen Artikel auf PubMed und deren zietierenden Artikel via iCite. 
* Sammeln aller Zusatzinformationen zu den jeweiligen Artikel (Citation_count, rCr ...)
* Exportieren der gesammelten Daten in ein graphML-Format, sodass diese in einer Visualisierungssoftware importiert werden kann

Darüberhinaus wird auf der Webseite zur gefundenen Ergebnissmenge ein Netzwerk erstellt, welches die Realtionen zwischen den Artikel visualisiert. 

### Entwickelt mit

Dieser Abschnitt widmet sich den genutzen Frameworks und Bibliotheken.

*Vanilla JavaScript (HTML, CSS & JS)
*Node.js
*Jquery
*AJAX
*D3.js


<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Voraussetzungen

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

_Im Folgenden finden Sie ein Beispiel dafür, wie die Installation und Einrichtung der App vorgenommen wird._

1. Klonen des Repositories
    ```sh
   git clone https://gitlab.ti.bfh.ch/gaupa1/revieWanted
   ```
   This is an example of how to clone the gitLab repository.
* Oder kopieren Sie den GitLab Link (GitHub Desktop App)
 ```sh
  https://gitlab.ti.bfh.ch/gaupa1/revieWanted
  ```

2. Öffnen der index.html Datei über den Browser 

<!-- USAGE EXAMPLES -->
## Nutzung

In diesem Projekt wird ein Umwandlungstool in Form einer Webseite erstellt, welche das Analysieren von Publikationsdaten (Zitationen) vorbereitet. Der Input wird in ein XML ähnliches Format geparsed (graphml). Somit wird das Ergebnis heruntergealden und in einem Visualisierungstool wie Gephi importiert. Des Weiteren besteht eine Möglichkeit für den Benutzer den Output zu parametrisieren, um den zu erstellenden Graphen weitere oder weniger Merkmale mitzugeben. 

1. Benutzereingabe in a) oder b)
![Benutzereingabe][step1]

2. Suchen starten: hierfür muss der Suchknopf betätigt werden.

3. Parameter auswählen
In diesem Schritt können Attribute ausgewählt werden, die mit exportiert werden sollen.
![Parameterwahl][step2]

4. Resultat ansehen
Das Resulatat kann folgendermassen aussehen:
![Resultat Screenshot][resultat]

5. Resultat exportieren
Hierfür klicken Sie auf den Link der nach der vollständigen Suche aktiviert wird
![Resultat exportieren][export]

6. Datei im Gephi öffnen

_Für mehr Inforamtionen lesen Sie bitte die technische Dokumentation_

<!-- ROADMAP -->
## Roadmap

- [x] Initial Push
- [x] Add Read.me
- [/] Parameterauswahl Funktionalität
- [X] vollständige Kommentierung des Codes  
- [X] Suche nach 
    - [X] Suchanfrage (Text)
    - [X] File-Upload (txt)
- [X] Export Funktion
- [ ] Interpretationsfunktion
- [ ] Usability Test


## Aktuelle Probleme
* SVG Visualierung mit D3 ohne Pfeile 
* die zweite Iterartion (SekundärListe) auf iCite / wird nicht sauber in der Konsole ausgegeben 



<!-- LICENSE -->
## Lizenz



<!-- CONTACT -->
## Kontakt

David Gaupp - gaupa1@bfh.ch
CHristian Merz - christian.merz@students.bfh.ch

Project Link: [https://github.com/gauppi/revieWanted](https://github.com/Gauppi/revieWanted)

<!-- ACKNOWLEDGMENTS -->
## Danksagungen

An dieser Stelle werden Ressourcen aufgelistet, die für deises Projekt hilfreich waren. Nachfolgend unsere Favoriten.
* [Git Tutorial](https://futurelab.pages.ti.bfh.ch/lecture-series/documentation/)
* [Git Teamplate](https://github.com/othneildrew/Best-README-Template)
* [D3 Force directed graph](https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8)



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[DemoView]: images/DemoView.PNG
[product-screenshot]: images/product-screenshot.PNG
[step1]: images/step1.PNG
[step2]: images/step2.PNG
[resultat]: images/resultat.PNG
[export]: images/export.PNG
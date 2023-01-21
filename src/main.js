import { searchFileorText, search, setAttributes, saveData } from "./search.js";

//-------------------------------------------------- Main.js ------------------------------------------------------------------------------------------------------------------------------------------------
//Fügt dem Texteingabefeld einen Eventlistener hinzu, damit Suche auch mittels Enter-Taste gestartet werden kann
document.getElementById("sterm").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        search(document.getElementById('searchquery').innerHTML = document.getElementById('sterm').value.toString());
    }
});

// Dokument ready Funktion setzt das Output DIV und der Lade-"Balken" auf unsichtbar
$(document).ready(function () {
    //Erstelle ein Eventlistener für eine Taste (gedrückt)

    let x = document.getElementById("divOutput");
    x.style.display = "none";
    x = document.getElementById("loader");
    x.style.display = "none";
    let input = document.querySelectorAll("input");
});

//Funktionen zur Veränderung der Sichtbarkeit

document.getElementById("btnreset").onclick = function (e) {
    document.getElementById("fileToLoad").value = "";
    document.getElementById("btnreset").style.visibility = "hidden";
}

document.getElementById("btnresetRev").onclick = function (e) {
    document.getElementById("fileToLoadReview").value = "";
    document.getElementById("btnresetRev").style.visibility = "hidden";
}

document.getElementById("arrow1").addEventListener("mouseover", (event) => {
    document.getElementById("tooltipFileupload").classList.toggle("show");
});

document.getElementById("arrow1").addEventListener("mouseleave", (event) => {
    document.getElementById("tooltipFileupload").classList.toggle("show");
});

document.getElementById("arrow2").addEventListener("mouseover", (event) => {
    document.getElementById("tooltipFileupload2").classList.toggle("show");
});
document.getElementById("arrow2").addEventListener("mouseleave", (event) => {
    document.getElementById("tooltipFileupload2").classList.toggle("show");
});

document.getElementById("arrow3").addEventListener("mouseover", (event) => {
    document.getElementById("tooltipPubmedSearchQuery").classList.toggle("show");
});
document.getElementById("arrow3").addEventListener("mouseleave", (event) => {
    document.getElementById("tooltipPubmedSearchQuery").classList.toggle("show");
});

const nreszit_tooltip = document.getElementById("arrow_results");
const nreszit_img = document.getElementById("nresultsZit_img");
const nreszit_img_ctnr = document.getElementById("centralizer");
nreszit_tooltip.addEventListener("mouseover", (event) => {
    nreszit_img.src = "icons/citationTypes.png";
    nreszit_img.alt = "citation types in result";
    nreszit_img_ctnr.style.height = "86px";
    nreszit_img.style.height = "86px";
});
nreszit_tooltip.addEventListener("mouseleave", (event) => {
    nreszit_img.src = "";
    nreszit_img.alt = "";
    nreszit_img.style.height = "0";
    nreszit_img_ctnr.style.height = "0";
});




document.getElementById("label1b").onclick = function (e) {
    let x = document.getElementById("divInputText");
    if (x.style.display === "none") {
        x.style.display = "block";
      } else {
        x.style.display = "none";
      }
}

document.getElementById("labelref").onclick = function (e) {
    window.open('https://icite.od.nih.gov/user_guide?page_id=ug_data#article');
}

//Suche starten (aufrufen der Funktion, die entscheided mit welchem Input gearbeitet wird)
document.getElementById("btnsendquery").onclick = function (e) {
    searchFileorText();
}

//Hinzufügen-Knopf beim Fileinput verstecken und die zweite AUswahl anzeigen
document.getElementById("btnadd").onclick = function (e) {
    document.getElementById("uploadOption").style.display = "block"
    document.getElementById("btnadd").style.display = "none"
}

// Beim drücken des delte-buttons wird die zweite Option versteckt
document.getElementById("btndelete").onclick = function (e) {
    document.getElementById('fileToLoadReview').value = "";
    document.getElementById("uploadOption").style.display = "none"
    document.getElementById("btnadd").style.display = "block"
}

//Festlegen der ausgewählten Attribute aus der Auswahl
document.getElementById("applyfilter").onclick = function (e) {
    setAttributes();
}

//Für jedes ausgewähltes Listen Element wird die Checkbox angepasst
document.getElementById("toggleAttributeSelection").onclick = function (e) {
    let chkbxs = $('input[type=checkbox]');
    let unchkd = 0;
    chkbxs.each(function () {
        if (!this.checked) unchkd++;
    });
    if (unchkd > 0) {
        chkbxs.prop('checked', true);
        document.getElementById("filter-button").classList.add('button--highlight');
    } else {
        chkbxs.prop('checked', false);
        document.getElementById("filter-button").classList.remove('button--highlight');
    }
}
//Zurücksetzten der Auswahl
document.getElementById("resetfilter").onclick = function (e) {
    $('input[type=checkbox]').each(function () {
        this.checked ^= 1; //XOR operator for toggling 'checked' status
    });
}

//Filter funktionen (Attribute) aktiv und inaktiv setzten + speichern für das Exportieren
document.getElementById("filter-button").onclick = function (e) {
    let input = document.getElementById("filter-button");
    for (let i = 0; i < input.length; i++) {
        var currentInput = input[i];

        currentInput.onclick = function () {
            let isChecked = false;
            for (let j = 0; j < input.length; j++) {
                if (input[j].checked) {
                    isChecked = true;
                    break;
                }
            }
            if (isChecked) {
                document.getElementById("filter-button").classList.add("button--highlight");
            } else {
                document.getElementById("filter-button").classList.remove("button--highlight");
            }
        };
    }
    e.stopPropagation();
    if (document.getElementById("filter-container").classList.contains("filters--active")) {
        
        document.getElementById("filter-container").classList.remove("filters--active");
        setAttributes();
    } else {
        document.getElementById("filter-container").classList.add("filters--active");
    }
};




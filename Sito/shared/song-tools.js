(() => {
    let annotationCounter = 0;
    const annotations = [];
    let lyricsBox;
    let explanationList;
    let rhetoricalList;
    let rhetoricalSearch;

    function nextId() {
        annotationCounter += 1;
        return `ann-${Date.now()}-${annotationCounter}`;
    }

    function computeLineNumber(range) {
        const preRange = document.createRange();
        preRange.selectNodeContents(lyricsBox);
        preRange.setEnd(range.startContainer, range.startOffset);
        const textBefore = preRange.toString();
        return textBefore.split(/\r\n|\r|\n/).length;
    }

    function clearMarkFlash() {
        lyricsBox.querySelectorAll(".lyrics-mark.is-target").forEach((el) => {
            el.classList.remove("is-target");
        });
    }

    function jumpToMark(id) {
        const mark = lyricsBox.querySelector(`[data-annotation-id="${id}"]`);
        if (!mark) {
            return;
        }
        clearMarkFlash();
        mark.classList.add("is-target");
        mark.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function createListItem(item, showFigureType) {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.className = "annotation-jump";
        btn.type = "button";

        const labelParts = [];
        if (showFigureType) {
            labelParts.push(item.figureType || "Figura non specificata");
        }
        labelParts.push(`"${item.text}"`);
        labelParts.push(`riga ~${item.line}`);
        btn.textContent = labelParts.join(" - ");
        btn.addEventListener("click", () => jumpToMark(item.id));

        const note = document.createElement("p");
        note.className = "annotation-note";
        note.textContent = item.note;

        li.appendChild(btn);
        li.appendChild(note);
        return li;
    }

    function renderLists() {
        explanationList.innerHTML = "";
        rhetoricalList.innerHTML = "";

        const query = (rhetoricalSearch.value || "").trim().toLowerCase();

        const explanationItems = annotations.filter((item) => item.kind === "spiegazione");
        explanationItems.forEach((item) => {
            explanationList.appendChild(createListItem(item, false));
        });

        const rhetoricalItems = annotations.filter((item) => item.kind === "figura-retorica").filter((item) => {
            if (!query) {
                return true;
            }
            const haystack = `${item.figureType} ${item.note} ${item.text}`.toLowerCase();
            return haystack.includes(query);
        });

        rhetoricalItems.forEach((item) => {
            rhetoricalList.appendChild(createListItem(item, true));
        });
    }

    function selectionInsideLyrics(selection) {
        if (!selection || selection.rangeCount === 0) {
            return false;
        }
        const range = selection.getRangeAt(0);
        const ancestor = range.commonAncestorContainer;
        return lyricsBox.contains(ancestor.nodeType === 1 ? ancestor : ancestor.parentNode);
    }

    function wrapRange(range, mark) {
        try {
            range.surroundContents(mark);
            return true;
        } catch (_error) {
            const extracted = range.extractContents();
            mark.appendChild(extracted);
            range.insertNode(mark);
            return true;
        }
    }

    function markSelection(kind) {
        const selection = window.getSelection();
        if (!selectionInsideLyrics(selection)) {
            alert("Seleziona prima una parte del testo dentro il box 'Testo della Canzone'.");
            return;
        }

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();
        if (!selectedText) {
            alert("La selezione e vuota. Evidenzia prima una frase del testo.");
            return;
        }

        const notePrompt = kind === "figura-retorica"
            ? "Scrivi una spiegazione breve della figura retorica scelta:"
            : "Scrivi una spiegazione della parte selezionata:";
        const note = window.prompt(notePrompt, "");
        if (note === null || !note.trim()) {
            return;
        }

        let figureType = "";
        if (kind === "figura-retorica") {
            figureType = window.prompt("Tipo di figura retorica (es. metafora, anafora, allitterazione):", "") || "";
        }

        const line = computeLineNumber(range);
        const id = nextId();
        const mark = document.createElement("mark");
        mark.className = `lyrics-mark ${kind === "figura-retorica" ? "is-rhetorical" : "is-explanation"}`;
        mark.dataset.annotationId = id;
        mark.title = kind === "figura-retorica"
            ? `${figureType || "Figura retorica"}: ${note.trim()}`
            : note.trim();

        wrapRange(range, mark);
        selection.removeAllRanges();

        annotations.push({
            id,
            kind,
            text: selectedText,
            note: note.trim(),
            figureType: figureType.trim(),
            line,
        });

        renderLists();
    }

    function clearAllAnnotations() {
        annotations.length = 0;
        lyricsBox.querySelectorAll(".lyrics-mark").forEach((mark) => {
            const textNode = document.createTextNode(mark.textContent || "");
            mark.replaceWith(textNode);
        });
        renderLists();
    }

    document.addEventListener("DOMContentLoaded", () => {
        lyricsBox = document.getElementById("lyrics-text");
        explanationList = document.getElementById("explanation-list");
        rhetoricalList = document.getElementById("rhetorical-list");
        rhetoricalSearch = document.getElementById("rhetorical-search");

        if (!lyricsBox || !explanationList || !rhetoricalList || !rhetoricalSearch) {
            return;
        }

        rhetoricalSearch.addEventListener("input", renderLists);
        renderLists();
    });

    window.songNotes = {
        markSelection,
        clearAllAnnotations,
    };
})();
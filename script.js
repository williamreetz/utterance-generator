const exampleText =
    '(teste/probiere/benutze) den (utterance-/phrasen-/)generator\n' +
    'du (sollst/musst) den (utterance-/phrasen-/)generator (testen/probieren/benutzen)\n' +
    '(der tester/die testerin/der testerich)  (muss/soll) den (utterance-/phrasen-/)generator testen'

// jquery stuff
$(document).ready(function () {
    $("#text-input").val(exampleText)
    $('#btn-transform').click(() => {
        const inputText = $("#text-input").val()
        const parser = new UtteranceGenerator()
        const parsed = parser.parseToText(inputText)
        $("#text-output").val(parsed)
        toggleAlert('Phrasen wurden generiert!')
    })
    $('#btn-text').click(() => {
        const inputText = $("#text-input").val()
        const parser = new UtteranceGenerator()
        const parsed = parser.parseToText(inputText)
        $("#text-output").val(parsed)
        toggleAlert('Phrasen wurden generiert!')
    })
    $('#btn-json').click(() => {
        const inputText = $("#text-input").val()
        const parser = new UtteranceGenerator()
        const parsed = parser.parseToJson(inputText)
        $("#text-output").val(parsed)
        toggleAlert('Phrasen wurden als JSON genriert!')
    })
    $('#copy-input').click(() => {
        const input = document.getElementById("text-input");
        input.select()
        document.execCommand("copy")
        toggleAlert('Text wurde kopiert!')
    })
    $('#copy-output').click(() => {
        const input = document.getElementById("text-output");
        input.select()
        document.execCommand("copy")
        toggleAlert('Text wurde kopiert!')
    })
    $('.search').click(() => {
        const input = $('.synonym-input').val()
        fetchSynonyms(input)
    })
})

function toggleAlert(text) {
    $('.alert').text(text)
    $('.alert').finish()
    $('.alert').fadeIn(300);
    $('.alert').delay(1000).fadeOut(1000);
}
// fetch openthesaurus api to get a list of synonyms
function fetchSynonyms(text) {
    if (!text) {
        toggleAlert('Bitte Suchbegriff eingeben!')
        return;
    }
    $.get('https://www.openthesaurus.de/synonyme/search?q=' + text + '&format=application/json', function (data) {
        const synsets = data.synsets
        if (synsets.length === 0) {
            toggleAlert('Keine Synonyme gefunden! :(')
            return;
        }
        const synonyms = []
        for (const synset of synsets) {
            for (const synonym of synset.terms) {
                synonyms.push(synonym.term)
            }
        }
        toggleAlert(synonyms.length + ' Synonyme gefunden!')
        $('.synonyms').text(synonyms.toString().replaceAll(',', ' | '))
    });
}

//----------------------------------------------------------
// TEXT PARSER
//----------------------------------------------------------
class UtteranceGenerator {

    parse(text) {
        let result = []
        const lines = this.linesToArray(text)

        for (const line of lines) {
            const noBrackets = line.match(/([^())]+)/g)
            for (let i in noBrackets) {
                noBrackets[i] = noBrackets[i].split('/')
            }
            let variants = this.getVariants(noBrackets)

            result.push(...variants)
        }
        return result
    }

    parseToText(text) {
        const parsed = this.parse(text)
        let result = ''
        for (const line of parsed) {
            result += line + '\n'
        }
        return result
    }

    parseToJson(text) {
        const parsed = this.parse(text)
        let result = '[\n  "' + parsed[0] + '"'
        for (let i = 1; i < parsed.length; i++) {
            result += ',\n  "' + parsed[i] + '"'
        }
        return result + '\n]'
    }
    linesToArray(input) {
        return input.split('\n')
    }

    getVariants(list) {
        let result = list[0].map(item => { return [item] })
        for (let i = 1; i < list.length; i++) {
            let next = []
            for (const item of result) {
                for (const word of list[i]) {
                    var line = item.slice(0)
                    line.push(word)
                    next.push(line)
                }
            }
            result = next
        }
        return this.variantsToTextArray(result)
    }

    variantsToTextArray(variants) {
        let result = []
        for (const line of variants) {
            let txtLine = ''
            for (const word of line) {
                txtLine += word
            }
            result.push(txtLine)
        }
        return result
    }

}
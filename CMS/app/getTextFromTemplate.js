/**
 * Created by kevrat on 19.07.2016.
 */
    function getTextFromTemplate (data) {
        var startIndex = -1;
        var buf;
        var name;
        var template = [];
        var findWordInData = function (data, startIndex, word) {
            while ((startIndex = data.indexOf(word, startIndex + 1)) != -1) {
                return startIndex;
            };
            return null;
        };

        while (startIndex = findWordInData(data, startIndex, "{{")) {
            buf = startIndex;
            if (startIndex = findWordInData(data, startIndex, "}}")) {
                name = (data.substring(buf + 2, startIndex)).trim();
                template.push(name);
            };
        };
        return template;
    };

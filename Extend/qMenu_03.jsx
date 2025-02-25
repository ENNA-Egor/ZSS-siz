/*
    v0.3
		поправил запоминание последних комманд, что бы запоминал сразу все атрибуты, т.к. например stroсk может быть и эффектом и стилем слоя
		// добавил стили слоя
*/
function qMenu_runScript(thisObj) {
    // переменная для слешей в путях файлов
    if ($.os.match(/Windows/)) {
        var _S = '\\';
    } else if ($.os.match(/Mac/)) {
        var _S = '/';
    }

    // глобальные имена переменных.
    // они будут добавляться при первом запуске в глобальную область видимости программы, для более быстрого к ней обращения
    var version = 0.3;
    var optionsFileName = 'options_' + version + '.txt'; // qMenu____options
    var lastCommandFileName = 'lastCommand_' + version + '.txt'; //
    var mostUsedFileName = 'mostUsedCommand_' + version + '.txt'; //
    // var allEffect = "allEffect";        // qMenu____allEffects - глобальная переменная

    function isSecurityPrefSet() {
        try {
            var securitySetting = app.preferences.getPrefAsLong(
                'Main Pref Section',
                'Pref_SCRIPTING_FILE_NETWORK_SECURITY'
            );
            return Boolean(securitySetting);
        } catch (e) {
            alert(
                'Error 01 in ' +
                    arguments.callee.name +
                    '\n\nUnable to call Preferences.\n\nMore info:\n' +
                    e
            );
            return false;
        }
    }

    function getUserDataFolder() {
        if (!isSecurityPrefSet()) {
            alert(
                "Network access disabled. To allow, please go to Preferences > General and check off 'Allow Scripts to Write Files and Access Network' to resolve."
            );
            try {
                app.executeCommand(app.findMenuCommandId('General...'));
            } catch (e) {
                alert(e);
            }
            if (!isSecurityPrefSet()) {
                return null;
            }
        }

        var scriptName = 'qMenu';
        var version = app.version.split('.')[0];
        var userDataFolder = Folder.userData;

        var pathFolder = new Folder(
            userDataFolder.toString() + _S + 'aescripts' + _S + 'qMenu' + _S + version
        );
        var scriptFolderInUserData = new Folder(pathFolder);
        if (!scriptFolderInUserData.exists) {
            var tryCreateFolder = scriptFolderInUserData.create();
            if (!tryCreateFolder) {
                alert(
                    'Error creating ' +
                        scriptName +
                        " files.\nCouldn't create folder " +
                        scriptName +
                        ' in ' +
                        userDataFolder.toString()
                );
                scriptFolderInUserData = Folder.temp;
                return scriptFolderInUserData.toString();
            }
        }

        scriptFolderInUserData = Folder(pathFolder);
        if (!scriptFolderInUserData.exists) {
            scriptFolderInUserData = scriptFolderInUserData.create();
        }
        var str = scriptFolderInUserData.fsName.toString();
        return str;
    }

    var optionFolder = getUserDataFolder();
    var languageFolder = Folder(optionFolder + _S + 'languages');
    if (!languageFolder.exists) {
        languageFolder.create();
    }
    var iconFolder = Folder(optionFolder + _S + 'icons');
    if (!iconFolder.exists) {
        iconFolder.create();
    }

    function create_read_optionsFile(_action) {
        //var optionFolder = getUserDataFolder();
        if (typeof _action == 'undefined') {
            var _action = 'create';
        }
        var optionFile = File(optionFolder + _S + optionsFileName);
        var defaultJSON;
        if (!optionFile.exists && _action == 'create') {
            defaultJSON = {
                maxSearchResult: 10,
                remenderLastCommand: 2,
                searchEngins: 'FirstL', // движки поиска "FirstL" - по первым буквам, "Mach" - совпадение во всем тексте
                translateFrom: 'rus',
                translateTo: 'eng',
                searchMenuComm: false,
                searchPressets: false,
                searchBlendingMode: false,
                searchLayerStyle: false,
                searchScripts: false,
                translate: true,
            };
            qMenu____options = defaultJSON;
            optionFile.open('w');
            optionFile.write(JSON.stringify(qMenu____options));
            optionFile.close();
        } else if (_action == 'create') {
            optionFile.open('r');
            var fileJson = optionFile.read();
            defaultJSON = JSON.parse(fileJson);
            qMenu____options = defaultJSON;
        } else if (_action == 'update') {
            optionFile.open('w');
            optionFile.write(JSON.stringify(qMenu____options));
            optionFile.close();
        }
    }

    function create_ListOfAllEffects() {
        // в данном случае при первом запуске создаем список всех эффектов и кладем его в глобальную переменную.
        // потом будем от туда считывать. это будет делать один раз при первом запуске.
        var allEff = {};
        var eff = app.effects;
        var i = 0;
        while (i < eff.length) {
            if (eff[i].category != '_Obsolete') {
                allEff[eff[i].displayName] = {
                    category: eff[i].category,
                    name: eff[i].displayName,
                    matchName: eff[i].matchName,
                    type: 'effect',
                };
            }
            i++;
        }
        qMenu____allEffects = allEff;
    }

    function create_ListOfAllScripts() {
        var scriptsFolder = Folder(Folder.appPackage.parent.fsName + _S + 'Scripts');
        if (!scriptsFolder.exists) {
            return;
        }
        qMenu____allScripts = {};
        getAllScripts(scriptsFolder);

        // runScript('rd_ScriptLauncher');

        function getAllScripts(_path) {
            if (!(_path instanceof Folder)) {
                _path = Folder(_path);
            }
            var objects = _path.getFiles();
            for (var i = 0; i < objects.length; i++) {
                if (objects[i] instanceof File) {
                    // var name = objects[i].displayName;
                    var ext = objects[i].displayName.substr(
                        objects[i].displayName.lastIndexOf('.')
                    );
                    if (ext.search(/jsx/) !== -1) {
                        var name = objects[i].displayName.replace(ext, '');
                        qMenu____allScripts[name] = {
                            path: objects[i].fsName,
                            name: name,
                            type: 'script',
                        };
                    }
                } else if (
                    objects[i] instanceof Folder &&
                    objects[i].displayName == 'ScriptUI Panels'
                ) {
                    getAllScripts(objects[i]);
                }
            }
        }
    }

    function create_upDate_lastItem(_action, _command) {
        var lastCommandFile = File(optionFolder + _S + lastCommandFileName);
        // var z1 = !lastCommandFile.exists;
        // var z2 = _action == "firstLanch";
        if (!lastCommandFile.exists && _action == 'firstLanch') {
            // нужно при первом запуске скрипта. т.е. еще нет ни файла, ни глобальной переменной, ни каких либо последних команд
            lastCommandFile.open('w');
            lastCommandFile.write('');
            lastCommandFile.close();
            qMenu____lastItem = qMenu____options.remenderLastCommand;
        } else if (lastCommandFile.exists && _action == 'firstLanch') {
            // если файл существует, но это первый запуск скрипта , значит нужно считать данные из файла и внести их в глобальную переменную
            lastCommandFile.open('r');
            var tempFile = JSON.parse(lastCommandFile.read());
            if (tempFile.length == 0) {
                qMenu____lastItem.length = qMenu____options.remenderLastCommand;
            } else {
                qMenu____lastItem = tempFile;
            }
            // если это апдейт данных, то нужно в первую очередь обновить данные в глобальной переменной, а потом записать их в файл
        } else if (_action == 'upDate') {
            var command = _command.info;
            // проверяем есть ли вообще что то в объекте qMenu____lastItem
            // for (var key in qMenu____lastItem) {
            // if (!qMenu____lastItem.hasOwnProperty(key)) {
            //     qMenu____lastItem.push(command);
            // } else {
            var i = 0;
            var newArr = [];
            while (
                i < qMenu____options.remenderLastCommand &&
                typeof qMenu____lastItem[i] != 'undefined'
            ) {
                if (qMenu____lastItem[i].name != command.name) {
                    newArr.push(qMenu____lastItem[i]);
                }
                i++;
            }
            newArr.unshift(command);
            qMenu____lastItem = newArr;
            // }
            if (qMenu____lastItem.length > qMenu____options.remenderLastCommand) {
                qMenu____lastItem.splice(qMenu____options.remenderLastCommand); // Обрезаем массив до максимальной длины
            }
            lastCommandFile.open('w');
            lastCommandFile.write(JSON.stringify(qMenu____lastItem));
            lastCommandFile.close();
            //     break;
            // }
        }
    }

    function create_upDate_mostUsedCommand(_command) {
        var mostUsedCommandFile = File(optionFolder + _S + mostUsedFileName);
        if (!mostUsedCommandFile.exists) {
            if (typeof _command != 'undefined') {
                // первый запуск, когда файла еще даже нет.
                // просто создаем JSON с текущим эффектом и его кол-вом раз использованием
                // var mostUsedCommandJSON = {};
                // mostUsedCommandJSON[_command.subItems[0].text]
                qMenu____mostUsedCommand[_command.subItems[0].text] = {
                    used: 1,
                    type: _command.type_Element,
                };
                mostUsedCommandFile.open('w');
                mostUsedCommandFile.write(JSON.stringify(qMenu____mostUsedCommand));
                mostUsedCommandFile.close();
            } else {
                qMenu____mostUsedCommand = {};
            }
        } else {
            if (typeof _command != 'undefined') {
                if (typeof qMenu____mostUsedCommand == 'undefined') {
                    mostUsedCommandFile.open('r');
                    qMenu____mostUsedCommand = JSON.parse(mostUsedCommandFile.read());
                    mostUsedCommandFile.close();
                }
                // var z1 = ++qMenu____mostUsedCommand[_command]; // = qMenu____mostUsedCommand[_command]++;
                if (_command.subItems[0].text in qMenu____mostUsedCommand) {
                    ++qMenu____mostUsedCommand[_command.subItems[0].text].used;
                } else {
                    qMenu____mostUsedCommand[_command.subItems[0].text] = {
                        used: 1,
                        type: _command.type_Element,
                    };
                }
                // qMenu____mostUsedCommand[_command] = +1;
                // var z2 = qMenu____mostUsedCommand[_command];

                mostUsedCommandFile.open('w');
                mostUsedCommandFile.write(JSON.stringify(qMenu____mostUsedCommand));
                mostUsedCommandFile.close();
            } else {
                mostUsedCommandFile.open('r');
                qMenu____mostUsedCommand = JSON.parse(mostUsedCommandFile.read());
                mostUsedCommandFile.close();
            }
        }
    }

    function readFromFile_and_returnArray(_file) {
        var langFile = File(_file);
        if (langFile.exists) {
            langFile.open('r');
            var arr = langFile.read().split('\t');
            langFile.close();
            return arr;
        }
    }

    function create_qM_translate_obj(_from, _to) {
        var fromFile = File(languageFolder.fsName + _S + _from + '.txt');
        if (!fromFile.exists) {
            fromFile.encoding = 'UTF-8';
            fromFile.open('w');
            fromFile.write('й	ц	у	к	е	н	г	ш	щ	з	х	ъ	ф	ы	в	а	п	р	о	л	д	ж	э	\\	я	ч	с	м	и	т	ь	б	ю	.		');
            fromFile.close();
        }
        var toFile = File(languageFolder.fsName + _S + _to + '.txt');
        if (!toFile.exists) {
            toFile.encoding = 'UTF-8';
            toFile.open('w');
            toFile.write("q	w	e	r	t	y	u	i	o	p	[	]	a	s	d	f	g	h	j	k	l	;	'	\\	z	x	c	v	b	n	m	,	.	/		");
            toFile.close();
        }

        var fromArr = readFromFile_and_returnArray(fromFile.fsName);
        var toArr = readFromFile_and_returnArray(toFile.fsName);
        qMenu____translateLetters = {};
        var i = 0;
        while (i < fromArr.length) {
            qMenu____translateLetters[fromArr[i]] = toArr[i];
            i++;
        }
    }

    var blendingMode = {
        Add: { blendMode: 'BlendingMode.ADD', name: 'Add', type: 'blendMode' },
        'Alpha Add': { blendMode: 'BlendingMode.ALPHA_ADD', name: 'Alpha Add', type: 'blendMode' },
        'Classic Color Burn': {
            blendMode: 'BlendingMode.CLASSIC_COLOR_BURN',
            name: 'Classic Color Burn',
            type: 'blendMode',
        },
        'Classic Color Dodge': {
            blendMode: 'BlendingMode.CLASSIC_COLOR_DODGE',
            name: 'Classic Color Dodge',
            type: 'blendMode',
        },
        'Classic Difference': {
            blendMode: 'BlendingMode.CLASSIC_DIFFERENCE',
            name: 'Classic Difference',
            type: 'blendMode',
        },
        Color: { blendMode: 'BlendingMode.COLOR', name: 'Color', type: 'blendMode' },
        'Color Burn': {
            blendMode: 'BlendingMode.COLOR_BURN',
            name: 'Color Burn',
            type: 'blendMode',
        },
        'Color Dodge': {
            blendMode: 'BlendingMode.COLOR_DODGE',
            name: 'Color Dodge',
            type: 'blendMode',
        },
        'Dancing Dissolve': {
            blendMode: 'BlendingMode.DANCING_DISSOLVE',
            name: 'Dancing Dissolve',
            type: 'blendMode',
        },
        Darken: { blendMode: 'BlendingMode.DARKEN', name: 'Darken', type: 'blendMode' },
        'Darken Color': {
            blendMode: 'BlendingMode.DARKER_COLOR',
            name: 'Darken Color',
            type: 'blendMode',
        },
        Difference: { blendMode: 'BlendingMode.DIFFERENCE', name: 'Difference', type: 'blendMode' },
        Disolve: { blendMode: 'BlendingMode.DISSOLVE', name: 'Disolve', type: 'blendMode' },
        Divide: { blendMode: 'BlendingMode.DIVIDE', name: 'Divide', type: 'blendMode' },
        Exclusion: { blendMode: 'BlendingMode.EXCLUSION', name: 'Exclusion', type: 'blendMode' },
        'Hard Light': {
            blendMode: 'BlendingMode.HARD_LIGHT',
            name: 'Hard Light',
            type: 'blendMode',
        },
        'Hard Mix': { blendMode: 'BlendingMode.HARD_MIX', name: 'Hard Mix', type: 'blendMode' },
        Hue: { blendMode: 'BlendingMode.HUE', name: 'Hue', type: 'blendMode' },
        Lighten: { blendMode: 'BlendingMode.LIGHTEN', name: 'Lighten', type: 'blendMode' },
        'Lighter Color': {
            blendMode: 'BlendingMode.LIGHTER_COLOR',
            name: 'Lighter Color',
            type: 'blendMode',
        },
        'Linear Burn': {
            blendMode: 'BlendingMode.LINEAR_BURN',
            name: 'Linear Burn',
            type: 'blendMode',
        },
        'Linear Dodge': {
            blendMode: 'BlendingMode.LINEAR_DODGE',
            name: 'Linear Dodge',
            type: 'blendMode',
        },
        'Linear Light': {
            blendMode: 'BlendingMode.LINEAR_LIGHT',
            name: 'Linear Light',
            type: 'blendMode',
        },
        'Lumeniscent Premul': {
            blendMode: 'BlendingMode.LUMINESCENT_PREMUL',
            name: 'Lumeniscent Premul',
            type: 'blendMode',
        },
        Luminosity: { blendMode: 'BlendingMode.LUMINOSITY', name: 'Luminosity', type: 'blendMode' },
        Multiply: { blendMode: 'BlendingMode.MULTIPLY', name: 'Multiply', type: 'blendMode' },
        Normal: { blendMode: 'BlendingMode.NORMAL', name: 'Normal', type: 'blendMode' },
        Overlay: { blendMode: 'BlendingMode.OVERLAY', name: 'Overlay', type: 'blendMode' },
        'Pin Light': { blendMode: 'BlendingMode.PIN_LIGHT', name: 'Pin Light', type: 'blendMode' },
        Saturation: { blendMode: 'BlendingMode.SATURATION', name: 'Saturation', type: 'blendMode' },
        Screen: { blendMode: 'BlendingMode.SCREEN', name: 'Screen', type: 'blendMode' },
        Subtract: { blendMode: 'BlendingMode.SUBTRACT', name: 'Subtract', type: 'blendMode' },
        'Silhouette Alpha': {
            blendMode: 'BlendingMode.SILHOUETE_ALPHA',
            name: 'Silhouette Alpha',
            type: 'blendMode',
        },
        'Silhouette Luma': {
            blendMode: 'BlendingMode.SILHOUETTE_LUMA',
            name: 'Silhouette Luma',
            type: 'blendMode',
        },
        'Soft Light': {
            blendMode: 'BlendingMode.SOFT_LIGHT',
            name: 'Soft Light',
            type: 'blendMode',
        },
        'Stencil Alpha': {
            blendMode: 'BlendingMode.STENCIL_ALPHA',
            name: 'Stencil Alpha',
            type: 'blendMode',
        },
        'Stencil Luma': {
            blendMode: 'BlendingMode.STENCIL_LUMA',
            name: 'Stencil Luma',
            type: 'blendMode',
        },
        'Vivid Light': {
            blendMode: 'BlendingMode.VIVID_LIGHT',
            name: 'Vivid Light',
            type: 'blendMode',
        },
    };

    var layerStyle = {
        'Drop Shadow': { id: 9000, name: 'Drop Shadow', type: 'layerStyle' },
        'Inner Shadow': { id: 9001, name: 'Inner Shadow', type: 'layerStyle' },
        'Outer Glow': { id: 9002, name: 'Outer Glow', type: 'layerStyle' },
        'Inner Glow': { id: 9003, name: 'Inner Glow', type: 'layerStyle' },
        'Bevel and Emboss': { id: 9004, name: 'Bevel and Emboss', type: 'layerStyle' },
        Satin: { id: 9005, name: 'Satin', type: 'layerStyle' },
        'Color Overlay': { id: 9006, name: 'Color Overlay', type: 'layerStyle' },
        'Gradient Overlay': { id: 9007, name: 'Gradient Overlay', type: 'layerStyle' },
        Stroke: { id: 9008, name: 'Stroke', type: 'layerStyle' },
    };
    try {
        if (typeof qMenu____options == 'undefined') {
            create_read_optionsFile();
        }
    } catch (e) {}

    try {
        if (typeof qMenu____allEffects == 'undefined') {
            create_ListOfAllEffects();
        }
    } catch (e) {}

    try {
        if (typeof qMenu____allScripts == 'undefined') {
            create_ListOfAllScripts();
        }
    } catch (e) {}

    try {
        if (typeof qMenu____lastItem == 'undefined') {
            create_upDate_lastItem('firstLanch');
        }
    } catch (e) {}

    try {
        if (typeof qMenu____mostUsedCommand == 'undefined') {
            create_upDate_mostUsedCommand();
        }
    } catch (e) {}

    try {
        if (typeof qMenu____translateLetters == 'undefined') {
            create_qM_translate_obj(qMenu____options.translateFrom, qMenu____options.translateTo);
        }
    } catch (e) {}

    /*
          ____ __ __  __ ____       ____  ____  ____  ____   ___ ______
         ||    || ||\ || || \\     ||    ||    ||    ||     //   | || |
         ||==  || ||\\|| ||  ))    ||==  ||==  ||==  ||==  ((      ||  
         ||    || || \|| ||_//     ||___ ||    ||    ||___  \\__   ||  
                                                                       
    */

    function search_EffectScriptsMenu(_inputArr, _object) {
        var searchIn, searchIn2, searchElement;
        var tempFL_EffArr = [];
        for (var key in _object) {
            // alert(key);
            var curEff = key.split(/[\s._]+/);
            if (curEff.length >= _inputArr.length) {
                //отсекаем все что меньше длинны массива вводимых символов
                var i = 0;
                while (i < _inputArr.length && _inputArr[i].length != 0) {
                    //цикл по длинне массива вводимых символов
                    var flagMatch = false;
                    searchElement = _inputArr[i].toLowerCase();
                    searchIn = curEff[i].toLowerCase();
                    if (i + 1 < curEff.length) {
                        searchIn2 = curEff[i + 1].toLowerCase();
                    } else {
                        searchIn2 = curEff[i].toLowerCase();
                    }
                    if (
                        searchIn.indexOf(searchElement) == 0 ||
                        searchIn2.indexOf(searchElement) == 0
                    ) {
                        flagMatch = true;
                    } else {
                        break;
                    }
                    i++;
                }
                if (flagMatch == true) {
                    tempFL_EffArr.push(_object[key]);
                }
                if (tempFL_EffArr.length >= qMenu____options.maxSearchResult) {
                    break;
                }
            }
        }
        // tempFL_EffArr = bubbleSort(tempFL_EffArr);

        return tempFL_EffArr;
    }

    //пузырьковая сортировка в зависимости от значений в другом объекте
    function bubbleSort(_arr) {
        var len = _arr.length;
        for (var key in qMenu____mostUsedCommand) {
            if (!qMenu____mostUsedCommand.hasOwnProperty(key)) {
                return false; // объект пустой
            } else {
                break;
            }
        }
        for (var i = 0; i < len - 1; i++) {
            for (var j = 0; j < len - 1 - i; j++) {
                // if (_arr [j]> _arr [j + 1]) {// попарное сравнение смежных элементов
                var findA, findB;
                if (
                    _arr[j].name in qMenu____mostUsedCommand &&
                    _arr[j].type == qMenu____mostUsedCommand[_arr[j].name].type
                ) {
                    findA = qMenu____mostUsedCommand[_arr[j].name].used;
                } else {
                    findA = 0.1;
                }
                if (
                    _arr[j + 1].name in qMenu____mostUsedCommand &&
                    _arr[j + 1].type == qMenu____mostUsedCommand[_arr[j + 1].name].type
                ) {
                    findB = qMenu____mostUsedCommand[_arr[j + 1].name].used;
                } else {
                    findB = 0.1;
                }
                if (findA < findB) {
                    // попарное сравнение смежных элементов
                    var temp = _arr[j + 1]; // обмен элемента
                    _arr[j + 1] = _arr[j];
                    _arr[j] = temp;
                }
            }
        }
        return _arr;
    }

    /*
         __ __ __
         || || ||
         || || ||
         \\_// ||
                 
    */
    // создаем или считываем иконки
    var iconOptions = File(iconFolder.fsName + _S + 'options.png');
    if (!iconOptions.exists) {
        createResourceFile('options', iconOptions); // название, бинарный код, папка для созранения.
        iconOptions = File(iconFolder.fsName + _S + 'options.png');
    }
    var iconPlugin = File(iconFolder.fsName + _S + 'plugin.png');
    if (!iconPlugin.exists) {
        createResourceFile('plugin', iconPlugin);
        iconPlugin = File(iconFolder.fsName + _S + 'plugin.png');
    }
    var iconScript = File(iconFolder.fsName + _S + 'script.png');
    if (!iconScript.exists) {
        createResourceFile('script', iconScript);
        iconScript = File(iconFolder.fsName + _S + 'script.png');
    }
    var iconBlendMode = File(iconFolder.fsName + _S + 'blendMode.png');
    if (!iconBlendMode.exists) {
        createResourceFile('blendMode', iconBlendMode);
        iconBlendMode = File(iconBlendMode.fsName + _S + 'blendMode.png');
    }
    var iconLayerStyle = File(iconFolder.fsName + _S + 'layerStyle.png');
    if (!iconLayerStyle.exists) {
        createResourceFile('layerStyle', iconLayerStyle);
        iconLayerStyle = File(iconLayerStyle.fsName + _S + 'layerStyle.png');
    }
    var qm_UI_main, mainGropUI, textGroup, optionIcon, listBox;

    // iconOptions = iconOptions.fsName.toString();
    // iconPlugin = iconPlugin.fsName;
    function buildUI(thisObj) {
        qm_UI_main =
            thisObj instanceof Panel
                ? thisObj
                : new Window('dialog', 'qMunu_alexIV', undefined, {
                      //   independent: true,
                      resizeable: false,
                      borderless: true,
                      closeOnKey: 'Escape',
                  });
        qm_UI_main.margins = 1;
        if (qm_UI_main != null) {
            mainGropUI = qm_UI_main.add(
                "group { orientation: 'column', alignment: ['fill','fill'], alignChildren: ['fill','fill'], margins: 0, spacing: 0}"
            );
            textGroup = mainGropUI.add("group {alignment: ['fill', 'top'],margins: 0, spacing: 0}");
            inputText = textGroup.add(
                "edittext {text: 'Input Command', alignment: ['fill','top']}"
            );
            optionIcon = textGroup.add(
                "iconbutton { size: [24, 24], alignment: ['right', 'center'], properties: {style: 'toolbutton', toggle: false}}"
            );
            optionIcon.image = iconOptions.fsName;
            // optionIcon = textGroup.add("iconbutton {image: '/Users/alekseiivanov/Library/Application Support/aescripts/qMenu/23/icons/options.png', size: [24, 24], alignment: ['right', 'center'], properties: {style: 'toolbutton', toggle: 'false'}}");

            // listBGroup = mainGropUI.add("group {alignment: ['fill','fill'], alignChildren: ['fill','fill'], margins: 0, spacing: 0}");
            listBox = mainGropUI.add(
                // 'listbox {}'
                // "listbox {alignment: ['fill','fill'], margin: [5, 0,0,0],properties: {multiselect: false}}"
                // "listbox {alignment: ['fill','fill'], margin: [5, 0,0,0],properties: {multiselect: false, numberOfColumns: 2}}"
                'listbox {properties: {multiselect: false, numberOfColumns: 2}}'
            );
        }

        mainGropUI.minimumSize.width = 220;
        mainGropUI.minimumSize.height = 300;
        // listBox.maximumSize.height = 300;
        inputText.active = true;

        // qm_UI_main.layout.resize();
        // qm_UI_main.layout.layout(true);

        if (qMenu____options.remenderLastCommand != 0 && qMenu____lastItem.length != 0) {
            createListBox(qMenu____lastItem, 'lastComm');
        }

        inputText.onChanging = function () {
            var allCommandArr = [];
            var inTxt = inputText.text.replace(/[\s]/, '').toLowerCase(); //пробуем перевести текст на анг.
            var z2 = inTxt.length; //длинна всех вводимых символов
            // var z3 = inTxt[z2 - 1] in qMenu____translateLetters; // проверяем есть ли последний символ в объекте для перевода
            if (inTxt[z2 - 1] in qMenu____translateLetters && qMenu____options.translate == true) {
                var inText = '';
                var i = 0;
                while (i < inputText.text.length) {
                    var letter = inputText.text[i].toLowerCase();
                    if (letter != ' ') {
                        inText = inText + letter.replace(letter, qMenu____translateLetters[letter]);
                    } else {
                        inText = inText + ' ';
                    }
                    i++;
                }
            } else {
                var inText = inputText.text;
            }
            if (inText == '=') {
                listBox.removeAll();
                var newItem = listBox.add('item', '-->  QUICK MENU  SETTINGS...');
                newItem.type_Element = 'options';
                newItem.selected = true;
            } else if (inText != '') {
                var strArr = inText.split(' ');
                // if (qMenu____options.)
                allCommandArr = allCommandArr.concat(
                    search_EffectScriptsMenu(strArr, qMenu____allEffects)
                );
                if (qMenu____options.searchScripts == true) {
                    allCommandArr = allCommandArr.concat(
                        search_EffectScriptsMenu(strArr, qMenu____allScripts)
                    );
                }

                if (qMenu____options.searchBlendingMode == true) {
                    allCommandArr = allCommandArr.concat(
                        search_EffectScriptsMenu(strArr, blendingMode)
                    );
                }

                if (qMenu____options.searchLayerStyle == true) {
                    allCommandArr = allCommandArr.concat(
                        search_EffectScriptsMenu(strArr, layerStyle)
                    );
                }
                allCommandArr = bubbleSort(allCommandArr);

                createListBox(allCommandArr);
            } else if (inText == '') {
                listBox.removeAll();
                // qm_UI_main.minimumSize.height = 23;
                // qm_UI_main.layout.layout(true);
            }
        };

        function createListBox(_arr, _lastComm) {
            // сюда передаем только имена эффектов
            // добавлять мачНэйм будем из глобального объекта по имени. добавлять тип пока вручную, потом что нибудь придумаем
            listBox.removeAll();
            var len = 0;
            var arr;
            // var icons = iconPlugin.fsName;
            if (typeof _lastComm == 'undefined') {
                if (qMenu____options.maxSearchResult < _arr.length) {
                    arr = qMenu____options.maxSearchResult;
                } else {
                    arr = _arr.length;
                }
            } else {
                arr = qMenu____options.remenderLastCommand;
            }
            for (var eff = 0; eff < arr; eff++) {
                try {
                    var newItem = listBox.add('item', '');
                    switch (_arr[eff].type) {
                        case 'effect':
                            newItem.match_Name = _arr[eff].matchName;
                            newItem.icon = iconPlugin.fsName;
                            break;

                        case 'script':
                            newItem.path = _arr[eff].path;
                            newItem.icon = iconScript.fsName;
                            break;

                        case 'blendMode':
                            newItem.blendMode = _arr[eff].blendMode;
                            newItem.icon = iconBlendMode.fsName;
                            break;

                        case 'layerStyle':
                            newItem.id = _arr[eff].id;
                            newItem.icon = iconLayerStyle.fsName;
                            break;

                        default:
                            // Действия, если _arr[eff].type не совпадает ни с одним из предыдущих случаев
                            break;
                    }

                    newItem.info = _arr[eff];
                    newItem.subItems[0].text = _arr[eff].name;
                    newItem.type_Element = _arr[eff].type;
                    // listBox.items[0].selected = true;
                    len++;
                } catch (e) {}
            }
            // var z = qm_UI_main;
            // qm_UI_main.size.height = (len * 23) + 2 - 50;
            // qm_UI_main.minimumSize = qm_UI_main.size;
            // qm_UI_main.size.height = (len * 23) + 2;
            // listBox.size.height = listBox.maximumSize.height = listBox.preferredSize.height = (len * 23) + 1;
            // qm_UI_main.layout.resize();
            // qm_UI_main.size.height = listBox.size.height + 29;
            // $.gc ();

            listBox.selection = 0;

            // qm_UI_main.layout.layout(true);
            // qm_UI_main.layout.layout( true );
            // qm_UI_main.update();
            // listBox.resize();
            // var z_qmSize = qm_UI_main.size.height;
            // var z_listSize = listBox.size.height;
        }

        inputText.addEventListener('keydown', function (_key) {
            if (_key.keyName == 'Enter') {
                doAction_with_SelectedElement();
            } else if (_key.keyName == 'Down') {
                // listBox.active = false;
                listBox.active = true;
                // var selItem = listBox.selection.index;
                // var zz = listBox.items.length;
                listBox.selection = 0;
                // listBox.items[selItem + 1].selected = true;
                // if (listBox.selection.index > listBox.items.length){
                //     listBox.selection = 0;
                // } else {
                //     listBox.selection = selItem + 1;
                //     // listBox.items[selItem + 1].selected = true;
                // }
            }
        });

        optionIcon.onClick = function () {
            qM_options_UI();
        };

        listBox.addEventListener('keyup', function (_key) {
            if (_key.keyName == 'Enter') {
                doAction_with_SelectedElement();
            }
        });

        function doAction_with_SelectedElement() {
            var z = listBox.selection;
            var type_Element = listBox.selection.type_Element;
            if (app.project.activeItem == null) {
                alert('No active composition');
                return;
            }
            var selLayers = app.project.activeItem.selectedLayers;
            if (selLayers.length == 0) {
                alert('No selected layers');
                return;
            }
            var i = 0;
            switch (type_Element) {
                case 'options':
                    // alert("11111");
                    qM_options_UI();
                    break;

                case 'effect':
                    while (i < selLayers.length) {
                        selLayers[i].Effects.addProperty(listBox.selection.match_Name);
                        i++;
                    }
                    break;
                case 'blendMode':
                    while (i < selLayers.length) {
                        if (
                            !(
                                selLayers[i] instanceof CameraLayer ||
                                selLayers[i] instanceof LightLayer ||
                                !selLayers[i].hasVideo
                            )
                        ) {
                            selLayers[i].blendingMode = eval(listBox.selection.blendMode);
                        }
                        i++;
                    }
                    break;
                case 'layerStyle':
                    while (i < selLayers.length) {
                        if (
                            !(
                                selLayers[i] instanceof CameraLayer ||
                                selLayers[i] instanceof LightLayer ||
                                !selLayers[i].hasVideo
                            )
                        ) {
                            app.executeCommand(listBox.selection.id);
                        }
                        i++;
                    }
                    break;
                case 'script':
                    var scriptFile = File(
                        qMenu____allScripts[listBox.selection.subItems[0].text].path
                    );
                    scriptFile.open('r');
                    try {
                        eval(scriptFile.read());
                    } catch (e) {}
                    break;
            }

            create_upDate_lastItem('upDate', listBox.selection); // запоминаем последнюю команду
            // create_upDate_lastItem('upDate', listBox.selection.subItems[0].text); // запоминаем последнюю команду
            create_upDate_mostUsedCommand(listBox.selection); //запоминаем сколько раз пользовались эффектом
            // create_upDate_mostUsedCommand(listBox.selection.subItems[0].text); //запоминаем сколько раз пользовались эффектом
            // alert(listBox.selection.typeElement + "\r" + listBox.selection.matchName);
            qm_UI_main.close();
        }

        //  ============================================================
        /*  ============================================================
               ___   ____  ______ __   ___   __  __  __     __ __ __   
              // \\  || \\ | || | ||  // \\  ||\ || (( \    || || ||   
             ((   )) ||_//   ||   || ((   )) ||\\||  \\     || || ||   
              \\_//  ||      ||   ||  \\_//  || \|| \_))    \\_// ||   
                                                                       
            ============================================================  
        */ //===========================================================

        function qM_options_UI() {
            var qM_optionsUI_win = new Window('dialog', 'Settings', undefined, {
                resizeable: false,
            });
            qM_optionsUI_win.orientation = 'column';
            qM_optionsUI_win.alignChildren = ['fill', 'fill'];
            qM_optionsUI_win.minimumSize = [400, 520];
            qM_optionsUI_win.spacing = 2;
            qM_optionsUI_win.margins = 5;
            if (qM_optionsUI_win != null) {
                var grpMainButt = qM_optionsUI_win.add(
                    "group {orientation: 'row', alignment: ['fill','top'], spacing: 10, margins: [20, 10, 0, 2]}"
                );

                var rButt_main = grpMainButt.add(
                    "radiobutton {text: 'Main Settings', value: true}"
                );
                var rButt_Castomize = grpMainButt.add("radiobutton {text: 'Customize'}");

                //PANEL
                var allStack = qM_optionsUI_win.add("group {orientation:'stack'}");

                // панелька со всеми основными свойствами. в неё добавляем все остальные опции
                var settPanel = allStack.add(
                    "panel {alignment:['fill', 'fill'], orientation: 'column', alignChildren:['fill', 'top'],  margins: 10, spacing: 10}"
                );

                // максимальное кол-во результатов поиска
                var grpMaxSearch = settPanel.add(
                    "group {orientation: 'row', alignment: ['fill','top'], spacing: 10, margins: 0}"
                );
                var textSearch = grpMaxSearch.add(
                    "statictext {text: 'Maximum Num Search', alignment: ['left','top']}"
                );
                var sliderSearch = grpMaxSearch.add(
                    "slider {minvalue: 1, maxvalue: 20, preferredSize: [150, 20], alignment: ['right','top']}"
                );
                var textNumSearch = grpMaxSearch.add(
                    "statictext {text: '0', alignment: ['right','top'], size: [50, 28]}"
                );
                sliderSearch.value = textNumSearch.text = qMenu____options.maxSearchResult;

                //  максимальное кол-во последних комманд
                var grpMaxLastCommand = settPanel.add(
                    "group {orientation: 'row', alignment: ['fill','top'], spacing: 10, margins: 0}"
                );
                var textLastComm = grpMaxLastCommand.add(
                    "statictext {text: 'Maximum Last Command', alignment: ['left','top']}"
                );
                var sliderLastComm = grpMaxLastCommand.add(
                    "slider {minvalue: 0, maxvalue: 20, preferredSize: [150, 20], alignment: ['right','top']}"
                );
                var textNumLastComm = grpMaxLastCommand.add(
                    "statictext {text: '0', alignment: ['right','top'], size: [50, 28]}"
                );
                sliderLastComm.value = textNumLastComm.text = qMenu____options.remenderLastCommand;

                // радиокнопки для выбора движка поиска
                var grpSearchEngine = settPanel.add(
                    "group {orientation: 'row', alignment: ['fill','top'], alignChildren:['left', 'top'], spacing: 10, margins: 0}"
                );
                var firstLetter = grpSearchEngine.add("radiobutton {text: 'by First Letter'}");
                var includeLetter = grpSearchEngine.add("radiobutton {text: 'by Any Coincidence'}");
                if (qMenu____options.searchEngins == 'FirstL') {
                    firstLetter.value = true;
                } else {
                    includeLetter.value = true;
                }

                // галочки для поиска по меню, по скриптам и по пресетам
                var searchMenuComm = settPanel.add(
                    "checkbox {text: 'Search Menu Command', value: " +
                        qMenu____options.searchMenuComm +
                        '}'
                );
                var searchPressets = settPanel.add(
                    "checkbox {text: 'Search Pressets', value: " +
                        qMenu____options.searchPressets +
                        '}'
                );
                var searchBlendingMode = settPanel.add(
                    "checkbox {text: 'Search Blending Mode', value: " +
                        qMenu____options.searchBlendingMode +
                        '}'
                );
                var searchLayerStyle = settPanel.add(
                    "checkbox {text: 'Search Layer Style', value: " +
                        qMenu____options.searchLayerStyle +
                        '}'
                );
                var searchScripts = settPanel.add(
                    "checkbox {text: 'Search Scripts', value: " +
                        qMenu____options.searchScripts +
                        '}'
                );

                // кнопки настройки перевода с какого языка на какой
                var translateTextGrp = settPanel.add(
                    "group {orientation: 'row', alignment: ['fill','top'], spacing: 10, margins: 0}"
                );
                var chekTrans = translateTextGrp.add(
                    "checkbox {text: 'Always Translate  to',  alignment: ['left','center']}"
                );
                chekTrans.value = qMenu____options.translate;
                var castomTrans = translateTextGrp.add(
                    "button {text: 'from .... to ....', alignment: ['fill', 'center'], preferredSize: ['fill', 20]}"
                );

                // группа кнопок с сохранением и выходом
                var exitGrp = qM_optionsUI_win.add(
                    "group {orientation: 'row', alignment: ['right','bottom'], spacing: 3, margins: 3, preferredSize: ['fill', '26']}"
                );
                var canselButt = exitGrp.add(
                    "button {text: 'Cancel', alignment: ['right', 'bottom']}"
                );
                var saveButt = exitGrp.add(
                    "button {text: 'Save and Exit', alignment: ['right', 'bottom']}"
                );

                // панелька со всеми основными свойствами. в неё добавляем все остальные опции
                var castomizePanel = allStack.add(
                    "panel {alignment:['fill', 'fill'], orientation: 'column', alignChildren:['fill', 'top'],  margins: 10, spacing: 10}"
                );

                castomTrans.text =
                    'from ' +
                    qMenu____options.translateFrom.toUpperCase() +
                    ' to ' +
                    qMenu____options.translateTo.toUpperCase();

                qM_optionsUI_win.layout.layout(true);
                qM_optionsUI_win.layout.resize();

                //всякие функции для панели управления
                //====================================

                /*
                     ___   __  __        ___    ____  ____    ____   ___  __  __  ____ __     __ 
                    // \\  ||\ ||       // \\  ||    ||       || \\ // \\ ||\ || ||    ||    (( \
                   ((   )) ||\\||      ((   )) ||==  ||==     ||_// ||=|| ||\\|| ||==  ||     \\ 
                    \\_//  || \||       \\_//  ||    ||       ||    || || || \|| ||___ ||__| \_))
                                                                                            
                */
                //переключение панелей
                SwitchTab('Main');
                rButt_main.onClick = function () {
                    SwitchTab('Main');
                };
                rButt_Castomize.onClick = function () {
                    SwitchTab('Castomize');
                };

                //функции вкл/выкл панелей.
                function SwitchTab(tab) {
                    settPanel.visible = false;
                    castomizePanel.visible = false;
                    switch (tab) {
                        case 'Main':
                            settPanel.visible = true;
                            break;
                        case 'Castomize':
                            castomizePanel.visible = true;
                            break;
                    }
                }

                /*
                     __  __    __ ____    ____ ____       ___ __  __  ___  __  __   ___   ____  __ 
                    (( \ ||    || || \\  ||    || \\     //   ||  || // \\ ||\ ||  // \\ ||    (( \
                     \\  ||    || ||  )) ||==  ||_//    ((    ||==|| ||=|| ||\\|| (( ___ ||==   \\ 
                    \_)) ||__| || ||_//  ||___ || \\     \\__ ||  || || || || \||  \\_|| ||___ \_))
                                                                                                    
                */

                sliderSearch.onChanging = function () {
                    textNumSearch.text = Math.round(sliderSearch.value);
                };
                // sliderSearch.onChange = function () {
                //     qMenu____options.maxSearchResult = Math.round(sliderSearch.value);
                //     create_read_optionsFile("update");
                // }

                sliderLastComm.onChanging = function () {
                    textNumLastComm.text = Math.round(sliderLastComm.value);
                };
                // sliderLastComm.onChange = function () {
                //     qMenu____options.remenderLastCommand = Math.round(sliderLastComm.value);
                //     create_read_optionsFile("update");
                // }

                /*
                    ______ ____   ___  __  __  __  __     ___  ______  ____     ____ ____    ___   ___  ___        ______   ___  
                    | || | || \\ // \\ ||\ || (( \ ||    // \\ | || | ||       ||    || \\  // \\  ||\\//||        | || |  // \\ 
                      ||   ||_// ||=|| ||\\||  \\  ||    ||=||   ||   ||==     ||==  ||_// ((   )) || \/ ||   ===    ||   ((   ))
                      ||   || \\ || || || \|| \_)) ||__| || ||   ||   ||___    ||    || \\  \\_//  ||    ||          ||    \\_// 
                                                                                                                                
                */
                chekTrans.onClick = function () {
                    qMenu____options.translate = chekTrans.value;
                    create_read_optionsFile('update');
                };

                castomTrans.onClick = function () {
                    buildTranslateUI();
                };

                function buildTranslateUI() {
                    // вытащили все имена языков из папки с языками
                    var allLanguagesName = [];
                    var i = 0; //переменная для всех циклов в этой функции
                    if (languageFolder.exists) {
                        var allFileInFolder = languageFolder.getFiles('*.txt');
                        if (allFileInFolder.length <= 1) {
                            create_qM_translate_obj(
                                qMenu____options.translateFrom,
                                qMenu____options.translateTo
                            );
                            allFileInFolder = languageFolder.getFiles('*.txt');
                        }
                        do {
                            var name = allFileInFolder[i].name.substr(
                                0,
                                allFileInFolder[i].name.lastIndexOf('.')
                            );
                            allLanguagesName.push(name);
                            i++;
                        } while (i < allFileInFolder.length);
                    }

                    var qM_translateLetterUI_win = new Window(
                        'dialog',
                        'Translate letters',
                        undefined,
                        {
                            resizeable: false,
                        }
                    );
                    qM_translateLetterUI_win.orientation = 'column';
                    qM_translateLetterUI_win.alignChildren = ['fill', 'fill'];
                    qM_translateLetterUI_win.preferredSize.width = 704;
                    qM_translateLetterUI_win.spacing = 5;
                    qM_translateLetterUI_win.margins = 10;

                    var sX = 50; // размер по ширине
                    if (qM_translateLetterUI_win != null) {
                        // минихелп оп панельке
                        /*
                        Слева находится буква, подлежащая переводу, справа - буква, подлежащая переводу.                         Cktdf yf[jlbncz ,erdf? gjlkt;fofz gthtdjle? cghfdf - ,erdf? gjlkt;fofz gthtdjle/ 
    
                        Он вводится так, как у вас есть на клавиатуре, и присваивается одной кнопке. 
                        Если вы хотите сохранить текущий набор, нажмите на кнопку рядом с выпадающим списком. 
                        Откроется окно, в котором вам нужно будет указать имя для сохранения файла.
                        */
                        var grpHelpText = qM_translateLetterUI_win.add(
                            "group {orientation: 'column', alignChildren: ['left','top'], margin: 0, spacing: 0}"
                        );
                        var stTextHelp1 = grpHelpText.add(
                            "statictext {text: 'On the left is the letter to be translated, on the right is the letter to be translated.'}"
                        );
                        var stTextHelp2 = grpHelpText.add(
                            "statictext {text: 'It is entered as you have it on the keyboard, and assigned to one button.'}"
                        );
                        var stTextHelp3 = grpHelpText.add(
                            "statictext {text: 'If you want to save the current set, click on the button next to the drop-down list.'}"
                        );
                        var stTextHelp4 = grpHelpText.add(
                            "statictext {text: 'A window will open in which you will need to specify a name for saving the file.'}"
                        );

                        // первая строка с выбором языков
                        var grpOptions = qM_translateLetterUI_win.add(
                            "group {orientation: 'row', alignChildren: ['left','top']}"
                        );
                        var txtT1 = grpOptions.add(
                            "statictext {text: 'Translate a letter from the language '}"
                        );
                        var ddlFrom = grpOptions.add('dropdownlist {size: [90, 23]}');
                        var ddlFrom_saveButt = grpOptions.add(
                            "button {text: 'save', size: [50, 23]}"
                        );
                        var txtT2 = grpOptions.add("statictext {text: ' to languages '}");
                        var ddlTo = grpOptions.add('dropdownlist {size: [90, 23]}');
                        var ddlTo_saveButt = grpOptions.add(
                            "button {text: 'save', size: [50, 23]}"
                        );

                        // панулька для всех букв
                        var keyboardPanel = qM_translateLetterUI_win.add(
                            "panel {orientation: 'column', alignment: ['fill', 'fill'],margins: 2, spacing: 2}"
                        );
                        var arrRow = []; //массив для всех строк
                        var letterGRP = []; //массив для всех групп
                        var lettFrom = []; //массив для всех букв С которого переводим
                        var lettTo = []; //массив всех букв НА который переводим
                        var row = (letter = let12 = 0);
                        // строим панельки для букв []=[], слева - какую переводим, справа - во что переводим
                        while (row < 3) {
                            arrRow[row] = keyboardPanel.add(
                                "group {orientation: 'row', alignment: ['fill', 'top'], alignChildren: ['fill', 'fill'], margins: 2, spacing: 5}"
                            );
                            while (let12 < 12) {
                                letterGRP[letter] = arrRow[row].add(
                                    "panel {orientation: 'row', alignment: ['fill', 'fill'], alignChildren: ['fill', 'fill'], margins: [7, 2, 7, 2], spacing: 2}"
                                );
                                lettFrom[letter] = letterGRP[letter].add(
                                    'edittext {minimumSize: [23, 23]}'
                                );
                                letterGRP[letter].add("statictext {text: '='}");
                                lettTo[letter] = letterGRP[letter].add(
                                    'edittext {minimumSize: [23, 23]}'
                                );
                                letter++;
                                let12++;
                            }
                            row++;
                            let12 = 0;
                        }

                        //группа с закрывающими кнопками
                        var grpClose = qM_translateLetterUI_win.add(
                            "group {orientation: 'row', alignChildren: ['right','bottom'], alignment: ['right', 'bottom'],margin: 5, spacing: 5}"
                        );
                        var buttCancel = grpClose.add("button {text: 'Cancel', size: [80, 23]}");
                        var buttSave = grpClose.add(
                            "button {text: 'Save and Exit', size: [80, 23]}"
                        );

                        //заполняем выпадающие списки для выбора языка
                        i = 0; //переназначаем переменную для цикла. т.к. её мы обозначили в начале функции
                        while (i < allLanguagesName.length) {
                            //заполняем выпадающие списки
                            ddlFrom.add('item', allLanguagesName[i]);
                            if (allLanguagesName[i] == qMenu____options.translateFrom) {
                                ddlFrom.selection = i;
                            }
                            ddlTo.add('item', allLanguagesName[i]);
                            if (allLanguagesName[i] == qMenu____options.translateTo) {
                                ddlTo.selection = i;
                            }
                            i++;
                        }

                        // заполняем ячейки буквами
                        fill_LettersSell(lettFrom, qMenu____options.translateFrom);
                        fill_LettersSell(lettTo, qMenu____options.translateTo);

                        qM_translateLetterUI_win.layout.layout(true);
                        qM_translateLetterUI_win.layout.resize();
                    }

                    //сохранение массива букв FROM
                    ddlFrom_saveButt.onClick = function () {
                        var newLangName = saveLetters(lettFrom);
                        addTo_ddList_lang(newLangName, ddlFrom);
                    };

                    //сохранение массива букв TO
                    ddlTo_saveButt.onClick = function () {
                        var newLangName = saveLetters(lettTo);
                        addTo_ddList_lang(newLangName, ddlTo);
                    };

                    //перезаполнение ячеек при выборе другого языка
                    ddlFrom.onChange = function () {
                        fill_LettersSell(lettFrom, ddlFrom.selection.text);
                    };
                    ddlTo.onChange = function () {
                        fill_LettersSell(lettTo, ddlTo.selection.text);
                    };

                    function saveLetters(_panels, _name) {
                        if (typeof _name == 'undefined') {
                            var _name = prompt(
                                'Enter a short language name',
                                'Enter a short language name'
                            );
                        }
                        // var z = _name.lastIndexOf('.');
                        if (_name != null && _name.lastIndexOf('.') != -1) {
                            _name = _name.slice(0, _name.lastIndexOf('.'));
                        }
                        var letters = [];
                        var save_letters_File = File(languageFolder.fsName + _S + _name + '.txt');
                        var i = 0;
                        while (i < _panels.length) {
                            var curLetter = _panels[i].text;
                            if (curLetter == '\\') {
                                curLetter = '\\';
                            }
                            letters.push(curLetter.toLowerCase());
                            i++;
                        }
                        // if (_options == "from") {
                        //     while (i < lettFrom.length){
                        //         letters.push(lettFrom[i].text.toUpperCase())
                        //         i++
                        //     }
                        // } else if (_options == "to") {
                        //     while (i < lettTo.length){
                        //         letters.push(lettTo[i].text.toUpperCase())
                        //         i++
                        //     }
                        // }
                        // letters = letters.join(";");
                        save_letters_File.encoding = 'UTF-8';
                        save_letters_File.open('w');
                        save_letters_File.write(letters.join('\t'));
                        save_letters_File.close();

                        return _name;
                    }

                    function addTo_ddList_lang(_name, _panel) {
                        // var allItem = []
                        var i = 0;
                        do {
                            if (i == _panel.items.length) {
                                _panel.add('item', _name);
                                _panel.selection = _panel.items[i].index;
                                return;
                            }
                            // если нашли в списке такое же имя - выбираем его и прекращаем дальнейшие действия
                            if (_name == _panel.items[i].text) {
                                _panel.selection = _panel.items[i].index;
                                return;
                            }

                            // allItem.push(_panel.items[i].text);
                            i++;
                        } while (i < _panel.items.length);
                    }

                    function fill_LettersSell(_panel, _nameLang) {
                        var lett_File = readFromFile_and_returnArray(
                            languageFolder.fsName + _S + _nameLang + '.txt'
                        );
                        var i = 0;
                        while (i < lett_File.length) {
                            try {
                                _panel[i].text = lett_File[i];
                            } catch (e) {}
                            i++;
                        }
                    }

                    /*
                         __   ___  __ __  ____         ____ _   _ __ ______    __     ____ ______ ______  ____ ____   __ 
                        (( \ // \\ || || ||           ||    \\ // || | || |    ||    ||    | || | | || | ||    || \\ (( \
                         \\  ||=|| \\ // ||==         ||==   )X(  ||   ||      ||    ||==    ||     ||   ||==  ||_//  \\ 
                        \_)) || ||  \V/  ||___        ||___ // \\ ||   ||      ||__| ||___   ||     ||   ||___ || \\ \_))
                                                                                                                                                                                                
                    */
                    buttSave.onClick = function () {
                        qMenu____options.translateFrom = ddlFrom.selection.text;
                        qMenu____options.translateTo = ddlTo.selection.text;
                        // создаем новый объект букв для перевода
                        var i = 0;
                        while (i < ddlFrom.length) {
                            qMenu____translateLetters[lettFrom[i]] = lettTo[i];
                            i++;
                        }
                        saveLetters(lettFrom, ddlFrom.selection.text); //сохраняем буквы которые надо переводить в текущий файл с языком
                        saveLetters(lettTo, ddlTo.selection.text); //сохраняем все буквы для перевода в текущий файл с языком
                        create_qM_translate_obj(ddlFrom.selection.text, ddlTo.selection.text);
                        create_read_optionsFile('update'); //обновляем все данные в файле настроек
                        qM_translateLetterUI_win.close();
                    };

                    if (qM_translateLetterUI_win instanceof Window) {
                        qM_translateLetterUI_win.center();
                        qM_translateLetterUI_win.show();
                    } else {
                        qM_translateLetterUI_win.layout.layout(true);
                    }
                }
                // ======================================================================
                // ======================================================================
                // ======================================================================

                /*
                     __   ___  __ __  ____         ____ _   _ __ ______            ___   ____  ______ __   ___   __  __  __ 
                    (( \ // \\ || || ||           ||    \\ // || | || |           // \\  || \\ | || | ||  // \\  ||\ || (( \
                     \\  ||=|| \\ // ||==         ||==   )X(  ||   ||      ===   ((   )) ||_//   ||   || ((   )) ||\\||  \\ 
                    \_)) || ||  \V/  ||___        ||___ // \\ ||   ||             \\_//  ||      ||   ||  \\_//  || \|| \_))
                                                                                                                    
                */
                saveButt.onClick = function () {
                    qMenu____options.maxSearchResult = Math.round(sliderSearch.value);
                    qMenu____options.remenderLastCommand = Math.round(sliderLastComm.value);
                    if (firstLetter.value == true) {
                        qMenu____options.searchEngins = 'FirstL';
                    } else if (includeLetter.value == true) {
                        qMenu____options.searchEngins = 'Includ';
                    }
                    qMenu____options.searchMenuComm = searchMenuComm.value;
                    qMenu____options.searchPressets = searchPressets.value;
                    qMenu____options.searchBlendingMode = searchBlendingMode.value;
                    qMenu____options.searchLayerStyle = searchLayerStyle.value;
                    qMenu____options.searchScripts = searchScripts.value;
                    qMenu____options.translate = chekTrans.value;
                    create_read_optionsFile('update');

                    qM_optionsUI_win.close();
                };

                if (qM_optionsUI_win instanceof Window) {
                    qM_optionsUI_win.center();
                    qM_optionsUI_win.show();
                } else {
                    qM_optionsUI_win.layout.layout(true);
                }
            }
        }

        // qm_UI_main.onShow = function () {
        //     qm_UI_main.minimumSize = qm_UI_main.preferredSize;
        //     qm_UI_main.update();
        //     qm_UI_main.layout.resize();
        //     qm_UI_main.layout.layout(true);
        // };

        // ============================================================
        // ============================================================
    }

    // var qMenu = buildUI(thisObj);
    buildUI(thisObj);

    if (qm_UI_main != null) {
        if (qm_UI_main instanceof Window) {
            qm_UI_main.center();
            qm_UI_main.show();
        } else {
            qm_UI_main.layout.layout(true);
        }
    }

    function createResourceFile(_filename, _path) {
        var allIcon = {
            options:
                '\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x17\x00\x00\x00\x18\b\x06\x00\x00\x00\x11|fu\x00\x00\x00\tpHYs\x00\x00\x0B\x12\x00\x00\x0B\x12\x01\u00D2\u00DD~\u00FC\x00\x00\x01\u0084IDATH\u0089\u00ADV1N\u00C3P\f}\r\u00D9ae\u0082\x1BPF&z\x04z\x02\u00C2b\u0089\u00A9\u00AClp\x03\x18\u00E3\u00A5\u00ED\u00C6\u00D8*\x17(\x1B\f\u0091\u00CA\r\u00C8\r\u00D2\r\u00A6 Gn\tU\u00BE\u00FF\x17\u00C9\u0093*U?\u00F6\u00B3\u00BF\u00FD\u00ECdPU\x15,0s\x02\u00E0\t\u00C0a\u00C3\u00EC\u0099\u0088\u00EELG\x00\u0091\u00CF\x00\u00C0\u00C3\x1E\u00B1`\u00C2\u00CC\u00A3N\u00E4\u00CC|\x04\u00E0\u00C4\u00F1x\u00D8\u0089\x1C\u00C0\u0095\u00F5L\u0083;Q\u00D7\\\u00AF8\x03 \u00C6\x0B\u00FDIM/=\u00C1\x0B-\u00DBP\x13\u0091[>\x12\u0091\u009Ca\u0090\u00A6\u00A9\x10\u00AE\u008D\u00EB\u00FF\x07c"ZD\u009Aa\u009F\u00C4Pu\u00D5\u0099\u0097-j\u00E8\x037q I\u00A1=\x11\u009C\x02\u00B8\x0E\u00F0\u00F9\u008C\u00B5,S\u00C3hNDI\u00F3\u0080\u0099W\x01>\u00AB\u0088\u0088$\u00A3s\x00\u009B\x16\u00A3\u008D\x06\u00FF\x03\u00F5\u0099\u00FB\u0092\u00A9uNDkU\u00CC>VDT:Hf\u00BE\u00F3\u0090\u00F1w\u00C1\x1C\u00A0\x1D\u00B9.\u00A7\u00B6\u0081\x19\x19S\u00E8\u009A\u00DE]\x7FD\u008A\u0089\u00A79\u00AFB\u00D4,\u008F&c\u00F9,%H\u00A8\u00CE\x0B]\t\u00A5f|\u00E6\u00B1\x17\u008Ccu\u00F0\u0091\u00CB\x04O\x02\b\u009B(#\u00A3\u00EB]P\u00D4:\u00D7=\u00F0\u00D13y\u00DD\u00D4\u0083,\u00CB\u00BE\u00F2<\x7F\x03p\x01\u00E0[\u0087\u00E3^\u009A\x1D\u00F0B\u0090\u00A4n\x01\u00BC\x038V\x7FY\u00B9/\u00D8\u00EEs\x17<\u00AAX\x12\u0091\u00F52\u00F1\x0E\u0091(\u00C4\x05\u00D9/&Lr\u00D5\u00B6\u00C8\u00B0\r\u00DD\u00C8\x15ru\x19\u00A4m\x10\u00F9/\u009F\x16m\u00BB\u00E8\x17\x00~\x00Sn~\u008F^W\u00AB\u00D2\x00\x00\x00\x00IEND\u00AEB`\u0082',
            plugin: '\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x12\x00\x00\x00\x12\b\x06\x00\x00\x00V\u00CE\u008EW\x00\x00\x00\tpHYs\x00\x00\x00\x01\x00\x00\x00\x01\x018"\u00F4@\x00\x00\x00$zTXtCreator\x00\x00x\u009CsL\u00C9OJUpL+I-RpMKKM.)\x06\x00Az\x06\u00CE\u00E7\u00CDsf\x00\x00\x02AIDAT8\u008D\u0095\u0092\u00CFJ[A\x14\u0087\u00BF3\u0099\u008E%W\u00B0\u00CD\u009F\u0096\u00D6\u0094J\x17.\u0082\x01-\u00DC\u0086\u00D6E]\u00A5 \u00D6\u00D2\u00C6n\u00C5B7\t\u00B8\u00F1\x01\\\x1B\u00CC"t\u00E5\x03\u00A8\u00E0;\u00F8\x06!\u00D9HD$\x1B)"m\u0093\u00A2R\u00D3&\u0098;]xM\u00D5\u00A6\u00A9\u00FEVg\u00CE9\u00F3\u009D\u00DFaF\x00\x01n\x03\u00F7\u0080G@\u00C4\u00CF\u00D5\u0080\u00CF\u00C07\u00CE\x14\x01b@\u00D4?\u009F\u00D7\u00BF\x02\u00BF\x02\u0080\x06\u00C2\u00C0Sc\u00CC[\x11y\u00A7\u0094\x1A\u00D7Z\u00DFo\u00B7\u00DB?\u0080#\x7F\u00D0(\u00F0\x06H\x03\u00E3>\u00F8\x04\u00F8\x0E\u00FC\u00D4\u00C0\x1D\u00E0\t\u0090*\x14\n\x19\x7F\x1A\u00D6\u00DA\u00E7\x0B\x0B\x0B\u00D2l6O\x00Ok\u00FD\u00AAP(dED\u00FC\u0096\x17\u00F3\u00F3\u00F3x\u009EW\x03Z\x1AH\x00/\u0081i.HDh\u00B7\u00DBS@\x0B\u00F0<\u00CF\u009B\u00963qa\u00D8\x14\u00F0\x050:\x10\b\u00BC\u00B7\u00D6\u00BE\u00F6\u00F7\u00BF$\u00A5\u00D4C\u00A5\u00D4\x07?v\u00AE\u00D6E\u00E41\u00F0\x11x \u00F9|\u00BE\x19\f\x06\u00CD\u00D5\u00A6\u00EB\u00E8\u00F4\u00F4\u00B4cN{\u009Ew\u00ABWc\u00A9T\u00A2^\u00AF\u00E3\u00BA.\u00D1h\u00F4R]k}\u00BE\u00A2(k\u00ADt\u00834\x1A\r\u0096\u0097\u0097;\u00F1\u00EE\u00EEnOw\u00BA[\u00D2Z\u00CB\u00EA\u00EA*\u00FD\u00FD\u00FD$\u0093I\u0092\u00C9dOHWP\u00ADVc}}\u009D\u009D\u009D\x1D\u0086\u0087\u0087)\x16\u008BT*\x15*\u0095\n\u0099L\u0086\u00CD\u00CDM\u00B6\u00B7\u00B7Y\\\\$\x14\nu\u00EE\u00A9\u00AB\u00A0H$B<\x1E\u00C7\x18C6\u009B\u00C5u]\u00E6\u00E6\u00E6\x18\x18\x18`ee\u0085\u00C9\u00C9Ir\u00B9\u00DC%HW\x10@\u00B9\\fdd\x04c\u00FE<f8\x1CF)\u00C5\u00E0\u00E0 }}}\u00FF_\u00AD^\u00AF\u00B3\u00B7\u00B7G*\u0095\u00A2\u00D5jqpp@\u00B5Z\u00C5q\x1C\u008E\u008F\u008F)\x16\u008B4\x1A\r&&&z;*\u0097\u00CB\u0084B!\x12\u0089\x04\u00FB\u00FB\u00FB\u00AC\u00AD\u00AD!"\u00CC\u00CE\u00CE266\u00C6\u00D6\u00D6\x16\u00AE\u00EB\u00FE\u00E5Hr\u00B9\u009Cu\x1C\u0087j\u00B5\u00CA\u00D0\u00D0\x10KKK\u00CC\u00CC\u00CC\x10\u008F\u00C7\u00BBm\u00DDU\u00D6Z\u00B4\u0088\u00D8\u00C3\u00C3C\u00D9\u00D8\u00D8 \x16\u008B\u0091N\u00A7o\x04\u00E98\u00CA\u00E7\u00F3\u00AD`0\u00F8\u00CF\u00DF}]Gb\u008C\u00F9d\u00AD}\x06\u00DC\x05\x027dx\u00C0\u0091R\u00AA\u00F4\x1B){\u00C8A\x07\u00C4Gp\x00\x00\x00\x00IEND\u00AEB`\u0082',
            script: '\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x12\x00\x00\x00\x12\b\x06\x00\x00\x00V\u00CE\u008EW\x00\x00\x00\tpHYs\x00\x00\x00\x01\x00\x00\x00\x01\x018"\u00F4@\x00\x00\x00$zTXtCreator\x00\x00x\u009CsL\u00C9OJUpL+I-RpMKKM.)\x06\x00Az\x06\u00CE\u00E7\u00CDsf\x00\x00\x01eIDAT8\u008D\u00AD\u0093\u00BFO\u00C2@\x14\u00C7?W\x0E\u00B0-\x1A\u00C5t\u0082\u00C9\u00C4\u00DD\u00C1\x01w\u00E2`\u00E2f\u00E2\u00D0\u00BF\u0081\u00C8\u00EC\u009F\u00E1\u0080\u0093l,\u0084\u00BF\x00\u00FF\x02\u00E3\u00EE\u008C\x03\x13C\x17\x05[\u00DA>\x07\u00A0Q)-\t~\u0093\u00CB\u00FDx\u00EF>\u00F7\u00DE\u00DD;\u00D5n\u00B7e2\u0099\u00B0\u008B\x1C\u00C7A;\u008EC\x18\u0086\u00BB\u0083F\u00A3\x11\u0083\u00C1`\u00CDx}u\u00C9\u00DB\u00EB\x10mdC\u00A2\x18.\u009A7\u00E8\u00E9t\u008A\u00E7yk\x0E\u00D5\u008A\u00E6\u00CC\u00F1\u00B0J\u00D9\u00A0Y\x00E\u0099\u00A2W\x0BJ)t\u00A1\x00J\x01\u00A0u\u0081r\u00A9\u00C8^\x11\x04!\u008E\u00D2\u00D3\u009F/\u00B7$\u00A0z\u00BD\u00CE\u00F3p\u0088Z\u0082\u008E\x0E\x0F\u0088\u00FD{\f\x05q\x14\u00F2\u00D0j\u00E0\u00CF>6F\u0096\u0080<\u00CF\u00E3\u00B1\u00D3I\f\u00FB\x15\x1B\u0099\x7Fb(\x10\x11\x02\u00FF+3E\u00FDsb\u009Af2\x0E\u00A3\x18\f\u0093\b@\u0081db \u00E7M\u00B6W\x12\u0091H\u00F6\u0099"\u008A4\x17\u0091E\u00D3\u00BFV2\u00F4\u00F2\u00AEH{\u00B8y\x04\u00E7\u00A7\u00A0k\u00B5\x1A\u00AE\u00EBb\x18\u00D9Y\u009E4n\x11\u0089\u00FF\u0084\u00B3\u00E8\u00CA\u0095c\u00F4x<\u00A6\u00D7\u00EBa\u009A&w\u00AD\u00D6FP\u00BF\u00DF\u00C7\u00F7\u00FDT\u009B\u00EB\u00BA\u00FFw\u00D9\t(\u00EF\u00B2W\u0085\u00BAI\u00DA\u00B6m\u00AA\u00D5*\x00O\u00DD\u00EEFG\u00CB\u00B2\u00B0,+\u00D5f\u00DB6\u00AA\u00D9lJ\u00A9\u0094\u00F33s\x14\x04\x01\u008A\u00FC\u00A2\u00DDJ\u00DF\u00A9mt0\u00E2\u00C4\u00BC\u00AC\x00\x00\x00\x00IEND\u00AEB`\u0082',
            blendMode:
                '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x12\x00\x00\x00\x12\x08\x06\x00\x00\x00V\xce\x8eW\x00\x00\x00\tpHYs\x00\x00\x00\x01\x00\x00\x00\x01\x018"\xf4@\x00\x00\x00$zTXtCreator\x00\x00x\x9csL\xc9OJUpL+I-RpMKKM.)\x06\x00Az\x06\xce\xe7\xcdsf\x00\x00\x02sIDAT8\x8d\xad\xd4MH\x14a\x1c\xc7\xf1\xef33\xab\xbb\xce(\x8a\xbd(\x98\xb4dJED\'/\x15QF\xe0AH\x08\x82\xae\xd2!\xf4\x1a\x05\x91Q\x07!:y\x0e\x0f\xe9\xc9\xa8C\x94J\x1d"\x92\x08J\xf0\x10-\xa2a\xbe\x94\xba\xca\xee\xba\xee\xdb\xcc\xee\xcc\xbf\xc3\xce\xaa\x84\xa5\x87\x1e\xf81\x0f\xcf3\xcfg\x9e\x87y\x9e\x07\xfeSQ\x7f\xeb\x10\xa8\x00\xee\x00=\x80\x07\xe4\x80\xac\xff\xdc^O\x03\x0fw\x02\x10\xb8"\xf0C@vIL\xa0}\'\xa4Y`l\x0f\x80\x08L\xe6\xe1\xc8\x9f\x80)\xd0\'`\xef\x05\x19\xban\x88\xb5a~G\xac\t<k\x8c\xb4\xd5\x84\xc0U\x81\xf9\xbd\x00N\x00\xe9\xe9/\x17\xc4*\xc6\xb5\xa6X4O\x01\x06\x1et\xba\xd0\xedB\xdf\xdb6}\xfa\xcd%]\xbe\x9e\xd0$V\xa3\xc4S[\xc8\xafz%g>\x84\xb6\x90\x8c\xf5\x9a\xde\xb2\x06\xc0\x04\x82\x00\x1aQ3\x8ck=\xdf|\xc9OE\xda\x92\xa6\x99\n9\xf7>$uKf\xb1\xdd\xab\xf4\xb4\xa9}\xfdZU(\x0c\xd4\x03\xb5@\xa5"o\xdd\xc5\xe0\xb6/\xff\xb3\x04\xb2\xb5\xb4\x8c\x0eP=\x7fA@\n\x888"\x12\xcf\xae|\xebV,\x9b\xed\x08\x87\x10\x1aQ4h*t\xd8\xf4N\x9eu\xcce\x957\xa3x\xba\r\x80\x15=\xcd\xb1WC\x94\'\x1b7a\xaf\x90[\x88~\x1e\xbc93|c\xc2\xa0.=\x0e\x84\x00\xf3x\xd7\xcb\xcb\xd5\xcdm\xe7\xb5@\xa8\xb8Q\x95G>\x18\xc3\xb1\x96\x08\xc5\x8f\xa2\x15\x82\x9b\x88\x9dX\xf82\xf5\xf4\xda\xbd\xe4\xec\xc7y@W\xc0\xfep\xc7\xa3\x96\x83\xad]\xf7\x8d\x8a\x9a\x8b\xbb-\x0f\x11\x89EFF"\x03\x9d\x83\xe2:\xab\xc0\x1a\x900Z\x1f,\xdf\nX\x07\xbaQ*\xb8\x9b\xe1\xe53\xb9\xb9\xd1\xde\x17?\xdf=\xfeTb\xfdx\xba\xd2\x8c\xf5L42\x9eY\x89L\xe6V\xa7g\xed\xf8\\4\xbf\xb1\x9c,d\x13\xb6\x14\x1cWi\x9a\xa6\xe9e\xba\xbd\xbe\x18\x8b<\xe9x\xb669<\x03$\xb7%\x05d\x15\x10\x06\xaa)\xfe\xc6Rj\x80*\x8a\x07\xd7\xd0\xcb-%\xe2e=\'\x93\x00b\xc0\xaa\x9f5 \x01\xa4\x0c\x7fj.\x90\x07l \x03\x18\x14O|\x16\xd0\\;\xe5\xfa\xf5$\x10\xf7\xb1Di6\x80c\xf8\x80\xe3\x03\xba\x0f\xdb\xc0\x06\x10\xa0x\xd5\x14(^\x19)`\xddOiY9 olC\xd86\xa0\x1c(\xf3\xe1R\xbb\xed\x7f=\xed\x03\x99\x12\x02\x14~\x03\x8dRs4\x83\xb5(\x95\x00\x00\x00\x00IEND\xaeB`\x82',
            layerStyle:
                "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x12\x00\x00\x00\x12\x08\x06\x00\x00\x00V\xce\x8eW\x00\x00\x00\tpHYs\x00\x00\x00\x01\x00\x00\x00\x01\x018\"\xf4@\x00\x00\x00$zTXtCreator\x00\x00x\x9csL\xc9OJUpL+I-RpMKKM.)\x06\x00Az\x06\xce\xe7\xcdsf\x00\x00\x04_IDAT8\x8d=\xd0\xdfoSe\x1c\xc7\xf1\xcf\xf7y\x9es\xda\x9e\xd3\xd3\xf5tc\x85\xb1\xb5\xeb\xd6vc\xc2\x98 3\x0b\x9a\xcd\x84\x104\\\x10\"7\x1a\xa3!\xf1\xc2p+\xe1/\xf0\x06\xf0\xd2\xbf\x80@\x84\x10.\xc4\x18~\xa8\x19\x06\xd9:\x05\x1c$\x1b\xd8\xfd\xec\x1c0\xb6v]\x7f\x9d\xf6\xfc\xe8\xe3\x05\xce\xf7\x1f\xf0\xbax\x13\xdeD\x004N4*8\xff4\xd6\xd9y(\x95N\xb7E\xda\xda\xec;w\xefz\xf9B\xa1\xce\x18\x9bo3\x8c\xf1\x0f::\xee\x7f\x1d\x89\xe4\x86r\xb9*\xad\xac\xd4\xe1yu\x00\xae\xf8\x0f\x02\x03|\x9c\xb1}_\x9e>\xfd\xc9\xf0\xc1\x83\x88'\x12 Um\xfe\xfe\xe0\x81S\xb3\xacFW{{\xedHww\xf2\xcc\xe8h\xb0\x87(@\x99L\x15[[\x8f\xb0\xb9\xf9\xf49\xf0\xe2\x7f\x88\x00\x1f#\n\xb7\x18\x06\xf4@\x00m\x91\x08\xfe\x9a\x9d\x85\x04\xc4\xeeh\xb49\xd6\xdf\xaf\x9f;s\xe6\xa3\x8e\xdb\xb7\xa3\xee\xad[\x90\x1b\x1b \xd7u\x1bDW\x16\x80\x0b\xdb\x10cDFP\xd7\xf7\xc7c1h\x9a\x86p$\x82L&\x03\xd9lbw{{\xf3\xe4\xc9\x93f\xf0\xea\xd5\xf0\x8d\x89\x89\xa9\xc0\xda\xda\xcfc\x96\xe5\xd3b\xb1\x13\x96\xe3|\xf6\xd8q\x1eoC\n'jK\xa7\xd3{}\xaa\n]\xd7!\x890==\r\x002\xa4(N<\x10\x10[\x0f\x1fz=[[7y\xb9\xfc\x8b\xaa\xeb\x16\xe2\xf1\x85\x9a\x10\xdf=\xcaf\x07\xc5\xf6\x1f\x10%z\x13\x89N\x9f\xaaB\x0f\x06\xb1\x94\xcb\xc9\x8d|\x1e\x00\x9a\r\xcb\xaa\x95gf\xbcT\xb5\x1a\xec\xac\xd7O\xb1\x8e\x0e\x15\xeb\xeb\x8f\x90\xc9,\xd5\xa5\xfc\xf8\x1d\xc6\xe6\x04\x00\xc6\x80 \x11\xbd\xdb\xdf\xd7G~\xbf\x1fFK\x0b&\xef\xddC\xb5V\x03\x88\xbc\x8dJ\xa5p\xff\xda\xb5\xe9}\xc0\xb0R.\x0fB\xcaAD\xa3\r\xb8\xeeLbm\xed\xfa1\xcf\xcb\xbe\x81\x18\x0bG\xa3\xd1\x03;\xa3Qh\x9a\x86\x90ibbbB\xba\xae+UU\xb5]\xc6\nY\xcf\xfb{\xa9\\\xbe\x95\x00\xba\xa9T\x1af\xa5\xd2~\xe2|\x88\x88\x06K\x9c\xeb\x0c\x80\xc2\x88\xdaS\xc9\xe4\x80\xaa(\xd0\x83AT\xaaUd\xe7\xe6\x00)\xa5\"D=\x11\x0eW\xbf:{vD\xd9\xb9\xb3\xff\x89\xa6\xfd\xf8\x84\xe8\x9c\x17\n}\x81d\xf2\x02\xc6\xc6\xbc\xa2\xdf\x7fJ0 \x00\xe0\xaddo\xaf\xb9\xfd';?/7\x8bE\x10c\x1e'\xaa\xc4\x14\xa5\x92\xde\xdc\xfcpu}}\xcf\x1e\xd7\x9dRLsV\x1c?\xfe\n\xa1\xd0,\x06\x06J\xe5\xe9i\xbf\xe0D\x06\xe7|\xb8/\x9dF \x10@K8\x8c\x9bw\xee\xc0\xb2,\x00\xf0l\xc7)\x95\xf2\xf9WV.\xf78\xee\xba\xef\x83\xb1o\xd0\xd7\xf7\xab\xec\xearhd\xe4p\xe1\xd2\xa5\xb6'D?\x08F\xd4\x9aH$\x86ZB!h\xba\x0e\xcd0\x90\x99\x9a\x92\x8dF\x03\x9c\xf3\xa6c\xdb\x8d?\x0b\x85\xe2oW\xae\\?\"D\xd0gYC\xf2\xd9\xb3\xbdn\xb1\x88\xec\xe5\xcb\xf2\xfbZ\xed\xe9s\xcb\xba)\x18QgoOOJ\x15\x02\xba\xaec=\x9f\x97/VWQ\xaf\xd7\xc1\x18c\xb6m\x1b\x05\xcb\xea<'\xa5\xf3\x1e\xf0S\x02\x98\x91\xc5bl\xa5R\xf1\xcd1\xb6\xb1\xecy\xcb\xaf\xa4l\x11\x92\xe8@*\x99\xf4\x0b!\xe0\xf3\xfb\xf1\xcf\xeaj\xb3T.\x93\xe7yp]W\xd4\xeb\xf5\x1dM)\xdf\x9e\x05b\xf3\x80\xa3\x00\x8a\xe0\x9c\x14U\x95\x8e\x94f\xd5u\x85\xe2\xf3\t!\x84\x18\xe8\x8e\xc7AD\xb0\x1b\r,//{\x8e\xe3\xc0\xa7\xaa\xcck6\xa9\xe9yA\xdbq\xba e\xd4a\xacI\x8aB\x86i\xf2X,\xa6t\xc5b\x95\xf1\xf1\xf1\x97\x9csM\x84\x0c\x83L\xd3\x84\xa6i\xa8V\xab\xd8\x11\x0e+\xfd\xa9\x947\xbf\xb0@\xb6m\x83\x0cC\xf1\xf9|\xc2\x0c\x87\xb1k\xd7.\x96J\xa5\xf8\xa1\xe1a\x1a9|\xb8q\xf1\xe2\xc5E\xd34W\xab\xd5\xea\xb20#\x91\x1b\xe1\xd6\xd6\xd1t2\xb9\x83\x01\xe8\xf4<\xfa\xf6\xfcy\xe1y\x1e@\x04\xce9TU\x85\xea\xf7\xc3\xef\xf7#\xa0\xebM!\xc4\xda\xc4\xe4\xe4\x1f\x0b\x8b\x8b\xcfm\xdb^\xac\xd5jK\xe2\xe8\xd1\xa3\xf7\\\xd7\xfd<\xd4\xdazB\xd7\xf5}\x9c\xf3V\"R\x89\x08RJOJ\xd9p\\\xb7R\xb7\xac\xcdR\xa9\xf4:;?\x9f\x9b\x9b\x9b{995\xf5bee\xe5u>\x9f/X\x96\xb5\xf5/\xde8\xf3\x1b1\xd1'\x12\x00\x00\x00\x00IEND\xaeB`\x82",
        };

        var resourceFile = File(_path);
        if (!resourceFile.exists) {
            resourceFile.encoding = 'BINARY';
            resourceFile.open('w');
            resourceFile.write(allIcon[_filename]);
            resourceFile.close();
        }
    }
}

// prettier-ignore
if (typeof JSON !== "object") {JSON = {};}
// prettier-ignore
(function () {"use strict";var rx_one = /^[\],:{}\s]*$/;var rx_two = /\\(?:"\\\/bfnrt]|u[0-9a-fA-F]{4})/g;var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;var rx_four = /(?:^|:|,)(?:\s*\[)+/g;var rx_escapable = /\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;var rx_dangerous = /\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;function f(n) {return n < 10 ? "0" + n : n;} function this_value() {return this.valueOf();} if (typeof Date.prototype.toJSON !== "function") { Date.prototype.toJSON = function () {return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null; }; Boolean.prototype.toJSON = this_value; Number.prototype.toJSON = this_value; String.prototype.toJSON = this_value;} var gap; var indent; var meta; var rep; function quote(string) { rx_escapable.lastIndex = 0; return rx_escapable.test(string) ? "\"" + string.replace(rx_escapable, function (a) { var c = meta[a]; return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4); }) + "\"" : "\"" + string + "\""; } function str(key, holder) { var i; var k; var v; var length; var mind = gap; var partial; var value = holder[key]; if (value && typeof value === "object" && typeof value.toJSON === "function") { value = value.toJSON(key); } if (typeof rep === "function") { value = rep.call(holder, key, value); } switch (typeof value) { case "string": return quote(value); case "number": return isFinite(value) ? String(value) : "null"; case "boolean": case "null": return String(value); case "object": if (!value) { return "null"; } gap += indent; partial = []; if (Object.prototype.toString.apply(value) === "[object Array]") { length = value.length; for (i = 0; i < length; i += 1) { partial[i] = str(i, value) || "null"; } v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]"; gap = mind; return v; } if (rep && typeof rep === "object") { length = rep.length; for (i = 0; i < length; i += 1) { if (typeof rep[i] === "string") { k = rep[i]; v = str(k, value); if (v) { partial.push(quote(k) + ( gap ? ": " : ":" ) + v); } } } } else { for (k in value) { if (Object.prototype.hasOwnProperty.call(value, k)) { v = str(k, value); if (v) { partial.push(quote(k) + ( gap ? ": " : ":" ) + v); } } } } v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}"; gap = mind; return v; } } if (typeof JSON.stringify !== "function") { meta = { "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", "\"": "\\\"", "\\": "\\\\" }; JSON.stringify = function (value, replacer, space) { var i; gap = ""; indent = ""; if (typeof space === "number") { for (i = 0; i < space; i += 1) { indent += " "; } } else if (typeof space === "string") { indent = space; } rep = replacer; if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) { throw new Error("JSON.stringify"); } return str("", {"": value}); }; } if (typeof JSON.parse !== "function") { JSON.parse = function (text, reviver) { var j; function walk(holder, key) { var k; var v; var value = holder[key]; if (value && typeof value === "object") { for (k in value) { if (Object.prototype.hasOwnProperty.call(value, k)) { v = walk(value, k); if (v !== undefined) { value[k] = v; } else { delete value[k]; } } } } return reviver.call(holder, key, value); } text = String(text); rx_dangerous.lastIndex = 0; if (rx_dangerous.test(text)) { text = text.replace(rx_dangerous, function (a) { return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4); }); } if ( rx_one.test( text .replace(rx_two, "@") .replace(rx_three, "]") .replace(rx_four, "") ) ) { j = eval("(" + text + ")"); return (typeof reviver === "function") ? walk({"": j}, "") : j; } throw new SyntaxError("JSON.parse");};}}());

qMenu_runScript(this);

/*
    v0.3
		поправил запоминание последних комманд, что бы запоминал сразу все атрибуты, т.к. например stroсk может быть и эффектом и стилем слоя
		добавил стили слоя

	v0.2
        поправил сохранение и применение настройки для перевода текста, когда набирается не на том языке
		добавил поиск по скриптам
*/

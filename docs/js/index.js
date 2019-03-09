function ge(id) {
    return document.getElementById(id);
}
function ce(tagName) {
    return document.createElement(tagName);
}
function cLI(innerText, classes, id, onClickFn) {
    const li = ce("li");
    li.innerText = innerText;
    classes.forEach(_ => addC(li, _));
    if (id)
        li.id = id;
    if (onClickFn)
        onClick(li, onClickFn);
    return li;
}
function remC(elm, cls) {
    elm.classList.remove(cls);
}
function addC(elm, cls) {
    elm.classList.add(cls);
}
function remAll(elm) {
    elm.innerHTML = "";
}
function onClick(elm, fn) {
    elm.addEventListener("click", fn);
}
function onLoad(fn) {
    window.addEventListener("load", fn);
}
class StringListStorage {
    constructor(key) {
        this.key = key;
        this._keys = [];
    }
    get keys() {
        this.update();
        return this._keys.slice();
    }
    set keys(keys) {
        this._keys = keys.slice();
        this.updateStorage();
    }
    get storageKey() {
        return this.key + "-stringListStorage";
    }
    has(key) {
        return this.keys.indexOf(key) >= 0;
    }
    add(key) {
        this._keys.push(key);
        this.updateStorage();
    }
    addIfNotExist(key) {
        this.update();
        if (this._keys.indexOf(key) < 0)
            this.add(key);
    }
    remove(key) {
        this.update();
        const i = this._keys.indexOf(key);
        if (i < 0)
            return false;
        this._keys.splice(i, 1);
        this.updateStorage();
        return true;
    }
    clear() {
        localStorage.removeItem(this.storageKey);
        this.update();
    }
    update() {
        const data = localStorage.getItem(this.storageKey);
        if (!data) {
            this._keys = [];
        }
        else {
            try {
                const list = JSON.parse(data);
                if (!Array.isArray(list) || list.some(_ => typeof _ != "string")) {
                    this._keys = [];
                }
                else {
                    this._keys = list;
                }
            }
            catch (e) {
                this._keys = [];
            }
        }
        this.updateStorage();
    }
    updateStorage() {
        const item = JSON.stringify(this._keys);
        localStorage.setItem(this.storageKey, item);
    }
}
class SelectOrInputUI {
    constructor(idPrefix, storage, onEnter = () => void 0) {
        this.root = ge(idPrefix);
        this.ul = ge(idPrefix + "_ul");
        this.input = ge(idPrefix + "_input");
        this.inputBtn = ge(idPrefix + "_enter");
        this.storage = storage;
        this.onEnter = onEnter;
        const self = this;
        onClick(this.inputBtn, () => {
            self.callOnEnter(this.input.value);
        });
    }
    show() {
        remC(this.root, "hide");
        const items = this.storage.keys;
        const ul = this.ul;
        remAll(ul);
        const self = this;
        items.forEach(text => {
            const li = cLI(text, [], undefined, () => {
                self.callOnEnter(text);
            });
            ul.appendChild(li);
        });
        this.input.value = "";
    }
    hide() {
        addC(this.root, "hide");
    }
    callOnEnter(text) {
        this.onEnter(text);
    }
}
class SigninUI {
    constructor(onClickFn = () => void 0) {
        this.root = ge("signin");
        this.btn = ge("signin_btn");
        this.onClick = onClickFn;
        const self = this;
        onClick(this.btn, () => {
            self.onClick();
        });
    }
    show() {
        remC(this.root, "hide");
    }
    hide() {
        addC(this.root, "hide");
    }
}
class QSetListUI {
    constructor() {
        this.onSelect = (item) => { };
        this.root = ge("qlist");
        this.ul = ge("qlist_ul");
    }
    show(qList) {
        remC(this.root, "hide");
        const ul = this.ul;
        remAll(ul);
        const self = this;
        qList.forEach(_ => {
            const li = cLI(_.sheetTitle, [], undefined, () => {
                self.onSelect(_);
            });
            ul.appendChild(li);
        });
    }
    hide() {
        addC(this.root, "hide");
    }
}
class QAndAUI {
    constructor() {
        this.items = [];
        this.onNext = (results) => { };
        this.root = ge("qanda");
        this.itemRoot = ge("qanda_itemroot");
        this.nextBtn = ge("quanda_next");
        this.log = ge("quanda_log");
        const self = this;
        onClick(this.nextBtn, () => self.callOnNext());
    }
    show(qAndAs, log) {
        remC(this.root, "hide");
        const itemRoot = this.itemRoot;
        remAll(itemRoot);
        this.items = [];
        const self = this;
        qAndAs.forEach(_ => {
            const div = ce("div");
            const q = ce("div");
            const a = ce("div");
            q.innerText = _.q;
            a.innerText = _.a;
            onClick(q, () => {
                remC(div, "trans-a");
                remC(div, "correct");
                addC(div, "wrong");
            });
            onClick(a, () => {
                remC(div, "trans-a");
                remC(div, "wrong");
                addC(div, "correct");
            });
            addC(div, "trans-a");
            addC(q, "qanda_item_q");
            addC(a, "qanda_item_a");
            div.appendChild(q);
            div.appendChild(a);
            addC(div, "qanda_item");
            itemRoot.appendChild(div);
            self.items.push(div);
        });
        this.showLog(log);
    }
    hide() {
        addC(this.root, "hide");
    }
    callOnNext() {
        const results = [];
        const notAnswereds = [];
        this.items.forEach((_, i) => {
            if (_.classList.contains("correct"))
                results.push(true);
            else if (_.classList.contains("wrong"))
                results.push(false);
            else
                notAnswereds.push(i + 1);
        });
        if (notAnswereds.length > 0) {
            this.showLog("You haven't answered to Q." + notAnswereds.join(", "));
            return;
        }
        this.onNext(results);
    }
    showLog(log) {
        this.log.innerText = log;
    }
}
class SheetProp {
    constructor(fileID, item) {
        this.fileID = fileID;
        this.item = item;
    }
    toQItem() {
        if (this.item.sheetType != "GRID")
            return undefined;
        return {
            fileID: this.fileID,
            sheetID: this.item.sheetId,
            sheetTitle: this.item.title
        };
    }
}
var DateUtil;
(function (DateUtil) {
    function parse(s) {
        const tmp = Date.parse(s);
        if (isNaN(tmp))
            return undefined;
        return new Date(tmp);
    }
    DateUtil.parse = parse;
    function str(d) {
        if (!d)
            return "";
        return d.toISOString();
    }
    DateUtil.str = str;
    function today() {
        return onlyDate(new Date());
    }
    DateUtil.today = today;
    function onlyDate(date) {
        return new Date(getDateNum(date));
    }
    DateUtil.onlyDate = onlyDate;
    function getDateNum(date) {
        return Math.floor(date.getTime() / 60 / 60 / 24 / 1000) * 60 * 60 * 24 * 1000;
    }
    DateUtil.getDateNum = getDateNum;
})(DateUtil || (DateUtil = {}));
function cells2QAndA(qItem, row, cells, warn) {
    let q = cells[0], a = cells[1], log = cells[2];
    let state = cells[3];
    let prevDate = DateUtil.parse(cells[4]);
    let interval = parseInt(cells[5]);
    let nextDate = DateUtil.parse(cells[6]);
    let failCount = parseInt(cells[7]);
    const initOrder = Math.random();
    if (state == "")
        state = "unseen";
    if (state != "unseen" && state != "learn" && state != "relearn") {
        warn('"State" should be set to "unseen", "learn" or "relearn"');
        state = "unseen";
    }
    if (state == "learn" || state == "relearn") {
        try {
            if (!prevDate || !nextDate || isNaN(interval) || isNaN(failCount)) {
                throw "";
            }
            const item = { q, a, log, state, prevDate, interval, nextDate, failCount, qItem, row, initOrder };
            return item;
        }
        catch (_a) {
            warn('"State" should be set to "unseen" because some data are incorrect.');
            state = "unseen";
            failCount = 0;
            prevDate = undefined;
            interval = NaN;
            nextDate = undefined;
        }
    }
    if (failCount != 0 && !isNaN(failCount))
        warn('"Fail Count" should be "" because the item is "unseen"');
    if (prevDate != undefined)
        warn('"Prev Date" should be "" because the item is "unseen"');
    if (!isNaN(interval))
        warn('"Interval" should be "" because the item is "unseen"');
    if (nextDate != undefined)
        warn('"Next Date" should be "" because the item is "unseen"');
    failCount = 0;
    prevDate = undefined;
    interval = undefined;
    nextDate = undefined;
    const item = { q, a, log, state: "unseen", prevDate, interval, nextDate, failCount, qItem, row, initOrder };
    return item;
}
function qAndA2UpdateReq(qAndA) {
    const _ = qAndA;
    const row = _.row, sheet = "'" + _.qItem.sheetTitle + "'";
    const intervalText = _.interval ? _.interval.toString() : "0";
    const range = sheet + "!C" + row + ":H" + row;
    const values = [[_.log, _.state, DateUtil.str(_.prevDate), _.interval || 0, DateUtil.str(_.nextDate), _.failCount]];
    return { range, values };
}
var GSheet;
(function (GSheet) {
    var isLoaded = false;
    function load() {
        gapi.load('client:auth2', () => {
            isLoaded = true;
        });
    }
    GSheet.load = load;
    function init(clientID, onDone = () => { }, onErr = (e) => { }) {
        if (!isLoaded)
            return false;
        gapi.client.init({
            clientId: clientID,
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
        }).then(_ => {
            onDone();
            if (gapi.auth2.getAuthInstance().isSignedIn.get())
                GSheet.onSignIn();
            gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
                if (isSignedIn)
                    GSheet.onSignIn();
                else
                    GSheet.onSignOut();
            });
        }).catch(e => {
            onErr(e);
        });
        return true;
    }
    GSheet.init = init;
    function promptSignIn() {
        gapi.auth2.getAuthInstance().signIn();
    }
    GSheet.promptSignIn = promptSignIn;
    GSheet.onSignIn = () => { };
    GSheet.onSignOut = () => { };
    function getQList(fileID, onSuccess = (qList) => { }, onErr = (e) => { }) {
        gapi.client.sheets.spreadsheets.get({
            spreadsheetId: fileID
        }).then(res => onSuccess(res.result.sheets.map(_ => new SheetProp(fileID, _.properties).toQItem()).filter(_ => _)), res => onErr(res.result.error));
    }
    GSheet.getQList = getQList;
    function getRangeRaw(fileID, range, onSuccess = (sheets) => { }, onErr = (e) => { }) {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: fileID,
            range: range,
            valueRenderOption: "FORMULA"
        }).then(res => onSuccess(res.result.values), res => onErr(res.result.error));
    }
    function getRange(fileID, range, onSuccess = (sheets) => { }, onErr = (e) => { }) {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: fileID,
            range: range,
            valueRenderOption: "UNFORMATTED_VALUE"
        }).then(res => onSuccess(res.result.values), res => onErr(res.result.error));
    }
    function loadQAndAList(qItem, onSuccess = (qAndA) => { }, onErr = (e) => { }) {
        const fileId = qItem.fileID;
        const sheetName = "'" + qItem.sheetTitle + "'";
        const QCountRange = sheetName + "!J1";
        getRange(fileId, QCountRange, cells => {
            const QCount = parseInt(cells[0][0]);
            if (isNaN(QCount)) {
                onErr("Invalid sheet as a database. The value of J1 cell should be the number of questions.");
                return;
            }
            const QAndARange = sheetName + "!A2:H" + (QCount + 1);
            getRange(fileId, QAndARange, cells => {
                let warnMsgs = [];
                const items = cells.map((cells, i) => {
                    for (let i = cells.length; i < 8; i++)
                        cells.push("");
                    let warn = (s) => warnMsgs.push(`row ${i + 2}: ${s}`);
                    return cells2QAndA(qItem, i + 2, cells, warn);
                });
                if (warnMsgs.length > 0)
                    onErr(warnMsgs.join("\n"));
                else
                    onSuccess(items);
            }, e => onErr(e));
        }, e => onErr(e));
    }
    GSheet.loadQAndAList = loadQAndAList;
    function saveQAndAs(qAndA, onSuccess = () => { }, onErr = (e) => { }) {
        let map = new Map();
        qAndA.forEach(_ => {
            const fileId = _.qItem.fileID;
            if (map.has(fileId))
                map.get(fileId).push(_);
            else
                map.set(fileId, [_]);
        });
        map.forEach((items, fileId) => {
            saveQAndASingleFile(fileId, items, onSuccess, onErr);
        });
    }
    GSheet.saveQAndAs = saveQAndAs;
    function saveQAndASingleFile(fileId, qAndA, onSuccess = () => { }, onErr = (e) => { }) {
        if (qAndA.some(_ => _.qItem.fileID != fileId))
            throw "BUG";
        let params = { spreadsheetId: fileId };
        var body = {
            valueInputOption: "RAW",
            data: qAndA.map(_ => qAndA2UpdateReq(_))
        };
        gapi.client.sheets.spreadsheets.values.batchUpdate(params, body)
            .then(_ => onSuccess(), e => onErr(e));
    }
})(GSheet || (GSheet = {}));
const QPerScreen = 10;
class Strategy {
    constructor(qAndAs) {
        this.pvQAndAs = undefined;
        this.qAndAs = qAndAs;
        this.sort();
    }
    next(results) {
        if (results)
            this.update(results);
        if (!results)
            if (this.pvQAndAs)
                throw "BUG";
        this.sort();
        if (this.qAndAs.length == 0)
            return { qAndAs: [], message: "No item found." };
        let message = "";
        const isOverLearning = (item) => item.state != "unseen" &&
            DateUtil.getDateNum(item.nextDate) > DateUtil.getDateNum(new Date());
        if (isOverLearning(this.qAndAs[0])) {
            const qAndAs = this.qAndAs.slice(0, QPerScreen);
            const message = "[over learning]";
            qAndAs.sort((a, b) => a.initOrder - b.initOrder);
            this.pvQAndAs = qAndAs;
            return { qAndAs, message };
        }
        else {
            const qAndAs = this.qAndAs.slice(0, QPerScreen).filter(_ => !isOverLearning(_));
            const message = "[learning]";
            qAndAs.sort((a, b) => a.initOrder - b.initOrder);
            this.pvQAndAs = qAndAs;
            return { qAndAs, message };
        }
    }
    update(results) {
        if (!this.pvQAndAs)
            throw "BUG";
        if (results.length != this.pvQAndAs.length)
            throw "BUG";
        this.pvQAndAs.forEach((qAndA, i) => {
            const result = results[i];
            const now = new Date();
            if (result) {
                qAndA.failCount = 0;
                const oneDay = 1 * 1000 * 60 * 60 * 24;
                if (qAndA.prevDate) {
                    const tmpInterval = (now.getTime() - qAndA.prevDate.getTime()) * 2.0;
                    qAndA.interval = Math.max(qAndA.interval, tmpInterval, oneDay);
                }
                else {
                    qAndA.interval = oneDay;
                }
                qAndA.state = "learn";
            }
            else {
                qAndA.failCount++;
                qAndA.interval = 0;
                qAndA.state = qAndA.state == "unseen" ? "learn" : "relearn";
            }
            qAndA.initOrder = Math.random();
            qAndA.prevDate = now;
            qAndA.nextDate = new Date(now.getTime() + qAndA.interval);
            qAndA.log += DateUtil.str(now) + (result ? "✓" : "✗") + " ";
        });
        GSheet.saveQAndAs(this.pvQAndAs, () => console.log("Save successed"), e => console.log("Save failed", e));
    }
    sort() {
        this.qAndAs.sort((a, b) => {
            const aState = a.state == "unseen" ? 0 : a.state == "relearn" ? 1 : 2;
            const bState = b.state == "unseen" ? 0 : b.state == "relearn" ? 1 : 2;
            if (aState != bState)
                return aState - bState;
            if (a.state == "unseen" || b.state == "unseen")
                return a.initOrder - b.initOrder;
            const tmp = DateUtil.getDateNum(a.nextDate) - DateUtil.getDateNum(b.nextDate);
            if (tmp != 0)
                return tmp;
            else
                return a.initOrder - b.initOrder;
        });
    }
}
onLoad(() => {
    const cli_idSt = new StringListStorage("clientid");
    const signinUI = new SigninUI();
    const fileIDSt = new StringListStorage("fileid");
    const cli_idUI = new SelectOrInputUI("clientid", cli_idSt);
    const fileIDUI = new SelectOrInputUI("fileid", fileIDSt);
    const qlist_UI = new QSetListUI();
    const qanda_UI = new QAndAUI();
    onClick(ge("clear_all"), () => {
        if (!confirm("Do you really want to clear all registered ClientIDs & FileIDs?"))
            return;
        cli_idSt.clear();
        fileIDSt.clear();
        alert("Cleared.");
        window.location.reload();
    });
    cli_idUI.onEnter = text => {
        cli_idUI.hide();
        GSheet.init(text, () => {
            cli_idSt.addIfNotExist(text);
            signinUI.show();
        }, e => {
            alert(JSON.stringify(e));
            location.reload();
        });
    };
    signinUI.onClick = () => {
        GSheet.promptSignIn();
    };
    GSheet.onSignIn = () => {
        signinUI.hide();
        fileIDUI.show();
    };
    GSheet.onSignOut = () => {
        alert("Signed out.");
    };
    let pvQList = undefined;
    fileIDUI.onEnter = text => {
        fileIDUI.hide();
        GSheet.getQList(text, qList => {
            fileIDSt.addIfNotExist(text);
            qlist_UI.show(qList);
            pvQList = qList;
        }, e => {
            alert(JSON.stringify(e));
            fileIDUI.show();
        });
    };
    let strategy = undefined;
    qlist_UI.onSelect = item => {
        qlist_UI.hide();
        GSheet.loadQAndAList(item, qAndA => {
            strategy = new Strategy(qAndA);
            const onNext = (results) => {
                if (!strategy) {
                    throw "BUG";
                }
                const { qAndAs, message } = strategy.next(results);
                qanda_UI.show(qAndAs, message);
            };
            qanda_UI.onNext = onNext;
            onNext();
        }, e => {
            if (typeof e == "string")
                alert(e);
            else
                alert(JSON.stringify(e));
            if (pvQList)
                qlist_UI.show(pvQList);
            else
                throw "BUG";
        });
    };
    cli_idUI.show();
    GSheet.load();
    window["gSheet"] = GSheet;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBUyxFQUFFLENBQUMsRUFBVTtJQUNyQixPQUFPLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFFLENBQUM7QUFDckMsQ0FBQztBQUNELFNBQVMsRUFBRSxDQUF3QyxPQUFVO0lBQzVELE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBQ0QsU0FBUyxHQUFHLENBQUMsU0FBaUIsRUFBRSxPQUFpQixFQUFFLEVBQVcsRUFBRSxTQUFxQjtJQUNwRixNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEIsRUFBRSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDekIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQyxJQUFJLEVBQUU7UUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNuQixJQUFJLFNBQVM7UUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLE9BQU8sRUFBRSxDQUFDO0FBQ1gsQ0FBQztBQUNELFNBQVMsSUFBSSxDQUFDLEdBQWdCLEVBQUUsR0FBVztJQUMxQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBQ0QsU0FBUyxJQUFJLENBQUMsR0FBZ0IsRUFBRSxHQUFXO0lBQzFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLENBQUM7QUFDRCxTQUFTLE1BQU0sQ0FBQyxHQUFnQjtJQUMvQixHQUFHLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNwQixD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
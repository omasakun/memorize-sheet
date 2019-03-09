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
                remC(div, "wrong");
                addC(div, "correct");
            });
            onClick(a, () => {
                remC(div, "trans-a");
                remC(div, "correct");
                addC(div, "wrong");
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
    const row = _.row, sheet = _.qItem.sheetTitle;
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
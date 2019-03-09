//#region ge ce cLI remC addC remAll onClick onLoad
function ge(id: string) {
	return document.getElementById(id)!;
}
function ce<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
	return document.createElement(tagName);
}
function cLI(innerText: string, classes: string[], id?: string, onClickFn?: () => any) {
	const li = ce("li");
	li.innerText = innerText;
	classes.forEach(_ => addC(li, _));
	if (id) li.id = id;
	if (onClickFn) onClick(li, onClickFn);
	return li;
}
function remC(elm: HTMLElement, cls: string) {
	elm.classList.remove(cls);
}
function addC(elm: HTMLElement, cls: string) {
	elm.classList.add(cls);
}
function remAll(elm: HTMLElement) {
	elm.innerHTML = "";
}
function onClick(elm: HTMLElement, fn: () => any) {
	elm.addEventListener("click", fn);
}
function onLoad(fn: () => any) {
	window.addEventListener("load", fn);
}
//#endregion
class StringListStorage {
	private _keys: string[]
	constructor(readonly key: string) {
		this._keys = [];
	}
	get keys() {
		this.update();
		return this._keys.slice();
	}
	set keys(keys: string[]) {
		this._keys = keys.slice();
		this.updateStorage();
	}
	private get storageKey() {
		return this.key + "-stringListStorage";
	}
	has(key: string) {
		return this.keys.indexOf(key) >= 0;
	}
	add(key: string) {
		this._keys.push(key);
		this.updateStorage();
	}
	addIfNotExist(key: string) {
		this.update();
		if (this._keys.indexOf(key) < 0)
			this.add(key);
	}
	/** 指定したアイテムが見つかって削除されたなら true. */
	remove(key: string): boolean {
		this.update();
		const i = this._keys.indexOf(key);
		if (i < 0) return false;
		this._keys.splice(i, 1);
		this.updateStorage();
		return true;
	}
	clear() {
		localStorage.removeItem(this.storageKey);
		this.update();
	}
	private update() {
		const data = localStorage.getItem(this.storageKey);
		if (!data) {
			this._keys = [];
		} else {
			try {
				const list = JSON.parse(data);
				if (!Array.isArray(list) || list.some(_ => typeof _ != "string")) {
					this._keys = [];
				} else {
					this._keys = list;
				}
			} catch (e) {
				this._keys = [];
			}
		}
		this.updateStorage();
	}
	private updateStorage() {
		const item = JSON.stringify(this._keys);
		localStorage.setItem(this.storageKey, item);
	}
}
class SelectOrInputUI {
	private root: HTMLDivElement
	private ul: HTMLUListElement
	private input: HTMLInputElement
	private inputBtn: HTMLButtonElement
	private storage: StringListStorage
	onEnter: (text: string) => void
	constructor(idPrefix: string, storage: StringListStorage, onEnter: (text: string) => void = () => void 0) {
		this.root = ge(idPrefix) as HTMLDivElement;
		this.ul = ge(idPrefix + "_ul") as HTMLUListElement;
		this.input = ge(idPrefix + "_input") as HTMLInputElement;
		this.inputBtn = ge(idPrefix + "_enter") as HTMLButtonElement;
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
	private callOnEnter(text: string) {
		this.onEnter(text);
	}
}
class SigninUI {
	private root: HTMLDivElement
	private btn: HTMLButtonElement
	onClick: () => void
	constructor(onClickFn: () => void = () => void 0) {
		this.root = ge("signin") as HTMLDivElement;
		this.btn = ge("signin_btn") as HTMLButtonElement;
		this.onClick = onClickFn
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
interface QItem {
	sheetTitle: string
	fileID: string
	sheetID: number
}
class QSetListUI {
	private root: HTMLDivElement
	private ul: HTMLUListElement
	onSelect = (item: QItem) => { }
	constructor() {
		this.root = ge("qlist") as HTMLDivElement;
		this.ul = ge("qlist_ul") as HTMLUListElement;
	}
	show(qList: QItem[]) {
		remC(this.root, "hide");
		const ul = this.ul;
		remAll(ul);
		const self = this
		qList.forEach(_ => {
			const li = cLI(_.sheetTitle, [], undefined, () => {
				self.onSelect(_);
			});
			ul.appendChild(li);
		})
	}
	hide() {
		addC(this.root, "hide");
	}
}
//#region QAndA Type
type QAndA = {
	q: string
	a: string
	log: string
	failCount: number
	qItem: QItem
	row: number
	initOrder: number
} & (
		{
			state: "unseen"
			prevDate: undefined
			interval: undefined
			nextDate: undefined
		} | {
			state: "relearn" | "learn"
			prevDate: Date
			interval: number
			nextDate: Date
		}
	);
//#endregion
class QAndAUI {
	private root: HTMLDivElement
	private itemRoot: HTMLDivElement
	private nextBtn: HTMLButtonElement
	private log: HTMLSpanElement
	private items: HTMLDivElement[] = []
	onNext = (results: boolean[]) => { }
	constructor() {
		this.root = ge("qanda") as HTMLDivElement;
		this.itemRoot = ge("qanda_itemroot") as HTMLDivElement;
		this.nextBtn = ge("quanda_next") as HTMLButtonElement;
		this.log = ge("quanda_log") as HTMLSpanElement;
		const self = this;
		onClick(this.nextBtn, () => self.callOnNext());
	}
	show(qAndAs: QAndA[], log: string) {
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
	private callOnNext() {
		const results: boolean[] = [];
		const notAnswereds: number[] = [];
		this.items.forEach((_, i) => {
			if (_.classList.contains("correct")) results.push(true);
			else if (_.classList.contains("wrong")) results.push(false);
			else notAnswereds.push(i + 1);
		});
		if (notAnswereds.length > 0) {
			this.showLog("You haven't answered to Q." + notAnswereds.join(", "));
			return;
		}
		this.onNext(results);
	}
	private showLog(log: string) {
		this.log.innerText = log;
	}
}
interface SheetPropI {
	gridProperties: { rowCount: number, columnCount: number }
	index: number
	sheetId: number
	sheetType: string // "GRID"
	title: string
}
class SheetProp {
	constructor(readonly fileID: string, readonly item: SheetPropI) {
		// Do nothing
	}
	toQItem(): QItem | undefined {
		if (this.item.sheetType != "GRID") return undefined;
		return {
			fileID: this.fileID,
			sheetID: this.item.sheetId,
			sheetTitle: this.item.title
		}
	}
}
namespace DateUtil {
	export function parse(s: string): Date | undefined {
		const tmp = Date.parse(s);
		if (isNaN(tmp)) return undefined;
		return new Date(tmp);
	}
	export function str(d: Date | undefined): string {
		if (!d) return "";
		return d.toISOString();
	}
	export function today(): Date {
		return onlyDate(new Date());
	}
	export function onlyDate(date: Date): Date {
		return new Date(getDateNum(date));
	}
	export function getDateNum(date: Date): number {
		return Math.floor(date.getTime() / 60 / 60 / 24 / 1000) * 60 * 60 * 24 * 1000;
	}
}
/** @param cells A*:H* */
function cells2QAndA(qItem: QItem, row: number, cells: string[], warn: (s: string) => void): QAndA {
	let q = cells[0], a = cells[1], log = cells[2];
	let state = cells[3];
	let prevDate = DateUtil.parse(cells[4]);
	let interval: number | undefined = parseInt(cells[5]);
	let nextDate = DateUtil.parse(cells[6]);
	let failCount = parseInt(cells[7]);
	const initOrder = Math.random();
	if (state == "") state = "unseen";
	if (state != "unseen" && state != "learn" && state != "relearn") {
		warn('"State" should be set to "unseen", "learn" or "relearn"');
		state = "unseen";
	}
	if (state == "learn" || state == "relearn") {
		try {
			if (!prevDate || !nextDate || isNaN(interval) || isNaN(failCount)) {
				throw "";
			}
			const item: QAndA = { q, a, log, state, prevDate, interval, nextDate, failCount, qItem, row, initOrder };
			return item;
		} catch{
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
	const item: QAndA = { q, a, log, state: "unseen", prevDate, interval, nextDate, failCount, qItem, row, initOrder };
	return item;
}
function qAndA2UpdateReq(qAndA: QAndA) {
	const _ = qAndA;
	const row = _.row, sheet = "'" + _.qItem.sheetTitle + "'";
	const intervalText = _.interval ? _.interval.toString() : "0";
	// const range = sheet + "!A" + row + ":H" + row;
	// const values = [[_.q, _.a, _.log, _.state, DateUtil.str(_.prevDate), intervalText, DateUtil.str(_.nextDate), _.failCount.toString()]];
	const range = sheet + "!C" + row + ":H" + row;
	const values = [[_.log, _.state, DateUtil.str(_.prevDate), _.interval || 0, DateUtil.str(_.nextDate), _.failCount]];

	return { range, values };
}
namespace GSheet {
	var isLoaded = false
	export function load() {
		gapi.load('client:auth2', () => {
			isLoaded = true;
		});
	}
	export function init(clientID: string, onDone = () => { }, onErr = (e: any) => { }) {
		if (!isLoaded) return false;
		gapi.client.init({
			clientId: clientID,
			scope: 'https://www.googleapis.com/auth/spreadsheets',
			discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
		}).then(_ => {
			onDone();
			if (gapi.auth2.getAuthInstance().isSignedIn.get())
				onSignIn();
			gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
				if (isSignedIn) onSignIn();
				else onSignOut();
			});
		}).catch(e => {
			onErr(e);
		});
		return true;
	}
	export function promptSignIn() {
		gapi.auth2.getAuthInstance().signIn();
	}
	export var onSignIn = () => { }
	export var onSignOut = () => { }
	export function getQList(fileID: string, onSuccess = (qList: QItem[]) => { }, onErr = (e: any) => { }) {
		gapi.client.sheets.spreadsheets.get({
			spreadsheetId: fileID
		}).then(
			res => onSuccess(res.result.sheets.map(
				_ => new SheetProp(fileID, _.properties).toQItem()
			).filter(_ => _)),
			res => onErr(res.result.error));
	}
	function getRangeRaw(fileID: string, range: string, onSuccess = (sheets: string[][]) => { }, onErr = (e: any) => { }) {
		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: fileID,
			range: range,
			valueRenderOption: "FORMULA"
		}).then(
			res => onSuccess(res.result.values),
			res => onErr(res.result.error));
	}
	function getRange(fileID: string, range: string, onSuccess = (sheets: string[][]) => { }, onErr = (e: any) => { }) {
		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: fileID,
			range: range,
			valueRenderOption: "UNFORMATTED_VALUE"
		}).then(
			res => onSuccess(res.result.values),
			res => onErr(res.result.error));
	}
	export function loadQAndAList(qItem: QItem, onSuccess = (qAndA: QAndA[]) => { }, onErr = (e: any) => { }) {
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
				let warnMsgs: string[] = [];
				const items: QAndA[] = cells.map((cells, i) => {
					for (let i = cells.length; i < 8; i++)cells.push("");
					let warn = (s: string) => warnMsgs.push(`row ${i + 2}: ${s}`);
					return cells2QAndA(qItem, i + 2, cells, warn);
				});
				if (warnMsgs.length > 0) onErr(warnMsgs.join("\n"));
				else onSuccess(items);
			}, e => onErr(e));
		}, e => onErr(e));
	}
	export function saveQAndAs(qAndA: QAndA[], onSuccess = () => { }, onErr = (e: any) => { }) {
		let map = new Map<string, QAndA[]>();
		qAndA.forEach(_ => {
			const fileId = _.qItem.fileID;
			if (map.has(fileId)) map.get(fileId)!.push(_);
			else map.set(fileId, [_]);
		});
		map.forEach((items, fileId) => {
			saveQAndASingleFile(fileId, items, onSuccess, onErr);
		});
	}
	function saveQAndASingleFile(fileId: string, qAndA: QAndA[], onSuccess = () => { }, onErr = (e: any) => { }) {
		if (qAndA.some(_ => _.qItem.fileID != fileId)) throw "BUG";
		let params = { spreadsheetId: fileId };
		var body = {
			valueInputOption: "RAW",
			data: qAndA.map(_ => qAndA2UpdateReq(_))
		};
		gapi.client.sheets.spreadsheets.values.batchUpdate(params, body)
			.then(
				_ => onSuccess(),
				e => onErr(e));
	}
}
const QPerScreen = 10;
class Strategy {
	private qAndAs: QAndA[]
	private pvQAndAs: QAndA[] | undefined = undefined;
	constructor(qAndAs: QAndA[]) {
		this.qAndAs = qAndAs;
		this.sort();
	}
	next(results?: boolean[]): { qAndAs: QAndA[], message: string } {
		if (results) this.update(results);
		if (!results) if (this.pvQAndAs) throw "BUG";
		this.sort();
		if (this.qAndAs.length == 0) return { qAndAs: [], message: "No item found." };

		let message = "";
		const isOverLearning = (item: QAndA) => item.state != "unseen" &&
			DateUtil.getDateNum(item.nextDate) > DateUtil.getDateNum(new Date());
		if (isOverLearning(this.qAndAs[0])) {
			const qAndAs = this.qAndAs.slice(0, QPerScreen);
			const message = "[over learning]";
			qAndAs.sort((a, b) => a.initOrder - b.initOrder);
			this.pvQAndAs = qAndAs;
			return { qAndAs, message };
		} else {
			const qAndAs = this.qAndAs.slice(0, QPerScreen).filter(_ => !isOverLearning(_));
			const message = "[learning]";
			qAndAs.sort((a, b) => a.initOrder - b.initOrder);
			this.pvQAndAs = qAndAs;
			return { qAndAs, message };
		}
	}
	private update(results: boolean[]) {
		if (!this.pvQAndAs) throw "BUG";
		if (results.length != this.pvQAndAs.length) throw "BUG";
		this.pvQAndAs.forEach((qAndA, i) => {
			const result = results[i];
			const now = new Date();
			if (result) {
				qAndA.failCount = 0;
				const oneDay = 1 * 1000 * 60 * 60 * 24;
				if (qAndA.prevDate) {
					const tmpInterval = (now.getTime() - qAndA.prevDate.getTime()) * 2.0; // TODO: change 2.0 to proper num.
					qAndA.interval = Math.max(qAndA.interval, tmpInterval, oneDay);
				} else {
					// @ts-ignore
					qAndA.interval = oneDay;
				}
				qAndA.state = "learn";
			} else {
				qAndA.failCount++;
				qAndA.interval = 0;
				qAndA.state = qAndA.state == "unseen" ? "learn" : "relearn";
			}
			qAndA.initOrder = Math.random();
			qAndA.prevDate = now;
			qAndA.nextDate = new Date(now.getTime() + qAndA.interval!);
			qAndA.log += DateUtil.str(now) + (result ? "✓" : "✗") + " ";
		});
		GSheet.saveQAndAs(this.pvQAndAs,
			() => console.log("Save successed"),// TODO
			e => console.log("Save failed", e) ,// TODO
		);
	}
	private sort() {
		this.qAndAs.sort((a, b) => {
			const aState = a.state == "unseen" ? 0 : a.state == "relearn" ? 1 : 2;
			const bState = b.state == "unseen" ? 0 : b.state == "relearn" ? 1 : 2;
			if (aState != bState) return aState - bState;
			if (a.state == "unseen" || b.state == "unseen") return a.initOrder - b.initOrder;
			const tmp = DateUtil.getDateNum(a.nextDate) - DateUtil.getDateNum(b.nextDate);
			if (tmp != 0) return tmp;
			else return a.initOrder - b.initOrder;
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
		if (!confirm("Do you really want to clear all registered ClientIDs & FileIDs?")) return;
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
			alert(JSON.stringify(e)); // TODO
			location.reload(); // gapiのinitは一回しかできないそうなので。
		});
	};
	signinUI.onClick = () => {
		GSheet.promptSignIn();
	}
	GSheet.onSignIn = () => {
		signinUI.hide();
		fileIDUI.show();
	}
	GSheet.onSignOut = () => {
		alert("Signed out."); // TODO
	}
	let pvQList: QItem[] | undefined = undefined;
	fileIDUI.onEnter = text => {
		fileIDUI.hide();
		GSheet.getQList(text, qList => {
			fileIDSt.addIfNotExist(text);
			qlist_UI.show(qList);
			pvQList = qList;
		}, e => {
			alert(JSON.stringify(e)); //TODO
			fileIDUI.show();
		});
	};
	let strategy: Strategy | undefined = undefined;
	qlist_UI.onSelect = item => {
		qlist_UI.hide();
		GSheet.loadQAndAList(item, qAndA => {
			strategy = new Strategy(qAndA);
			const onNext = (results?: boolean[]) => {
				if (!strategy) {
					throw "BUG";
				}
				const { qAndAs, message } = strategy.next(results);
				qanda_UI.show(qAndAs, message);
			}
			qanda_UI.onNext = onNext;
			onNext();
		}, e => {
			if (typeof e == "string")
				alert(e);
			else
				alert(JSON.stringify(e)); //TODO
			if (pvQList)
				qlist_UI.show(pvQList);
			else
				throw "BUG";
		});
	}
	// qanda_UI.onNext should be set on qlist_UI.onSelect handler
	cli_idUI.show();
	// qanda_UI.show(JSON.parse(`[{"q":"Q1","a":"A1"},{"q":"Q2","a":"A2"},{"q":"Q3","a":"A3"},{"q":"Q4","a":"A4"},{"q":"Q5","a":"A5"}]`), "Just for test.");
	GSheet.load();
	window["gSheet"] = GSheet;
});

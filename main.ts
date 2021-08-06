import { App, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { Moment } from 'moment';

interface NavigatorSettings {
	commonPrefixSeparators: string;
	commonPrefixExtendSearch: boolean;
	todayDateFormat: string;
	autoRevealFileInExplorer: boolean;
};

const DEFAULT_SETTINGS: NavigatorSettings = {
	commonPrefixSeparators: '-:_+ /,;?!',
	commonPrefixExtendSearch: true,
	todayDateFormat: 'YYYY-MM-DD',
	autoRevealFileInExplorer: false
};

function multisplit(str: string, separators: string[]) {
	if(!separators.length) return str.split('');

	let sep = separators[0];
	for(let i=1; i<separators.length; ++i) {
		str = str.split(separators[i]).join(sep);
	}
	return str.split(sep);
}
function longestCommonPrefixWithSeparators(reference: string, separators: string, arr: string[]) {
	if(!arr.length) return '';

	let pieces = multisplit(reference, separators.split(''));
	let lastPrefix = '';
	for(let i=0; i<pieces.length; ++i) {
		let prefix = lastPrefix + (i == 0? '' : reference[lastPrefix.length]) + pieces[i];
		if(arr.filter(str => str !== prefix && str.startsWith(prefix)).length == 0) {
			return lastPrefix;
		}
		lastPrefix = prefix;
	}

	return reference;
}

function indexOfPrevNextWithCommonPrefix(files: TFile[], current: number, length: number, settings: NavigatorSettings, isNext: boolean): number {
	let strFiles = files.map(f => f.basename);
	let reference = files[current].basename;
	let prefix = longestCommonPrefixWithSeparators(reference, settings.commonPrefixSeparators, strFiles);
	if(!prefix.length) {
		if(settings.commonPrefixExtendSearch && (
			(!isNext && current > 0)
			|| (isNext && current + 1 < length)
			)) {
			return isNext? (current + 1) : (current - 1);
		} else {
			return length;
		}
	}

	let filterFn = (file: TFile) => file.basename.startsWith(prefix);
	let idx = isNext? files.map(filterFn).lastIndexOf(true) : files.findIndex(filterFn);
	
	if(idx === current && settings.commonPrefixExtendSearch && (
		(!isNext && current > 0)
		|| (isNext && current + 1 < length)
		)) {
		return isNext? (current + 1) : (current - 1);
	}

	return idx;
}

const SORTING_METHODS = [
	{
		id: 'alpha',
		byString: 'name',
		fn: (a: TFile, b: TFile) => a.basename.localeCompare(b.basename),
	},
	{
		id: 'ctime',
		byString: 'creation date',
		fn: (a: TFile, b: TFile) => a.stat.ctime - b.stat.ctime
	},
	{
		id: 'mtime',
		byString: 'modification date',
		fn: (a: TFile, b: TFile) => a.stat.mtime - b.stat.mtime
	},
];

const MOVEMENT_METHODS = [
	{
		id: 'next',
		whichString: 'next',
		fn: (files: TFile[], current: number, length: number, settings: NavigatorSettings) => current + 1
	},
	{
		id: 'previous',
		whichString: 'previous',
		fn: (files: TFile[], current: number, length: number, settings: NavigatorSettings) => current - 1
	},
	{
		id: 'first',
		whichString: 'first',
		fn: (files: TFile[], current: number, length: number, settings: NavigatorSettings) => 0
	},
	{
		id: 'last',
		whichString: 'last',
		fn: (files: TFile[], current: number, length: number, settings: NavigatorSettings) => length - 1
	},
	{
		id: 'today-first',
		whichString: "first with today in name",
		fn: (files: TFile[], current: number, length: number, settings: NavigatorSettings) => {
			let todaystr = window.moment(new Date()).format(settings.todayDateFormat);
			return files.findIndex(file => file.basename.includes(todaystr));
		}
	},
	{
		id: 'today-last',
		whichString: "last with today in name",
		fn: (files: TFile[], current: number, length: number, settings: NavigatorSettings) => {
			let todaystr = window.moment(new Date()).format(settings.todayDateFormat);
			return files.map(file => file.basename.includes(todaystr)).lastIndexOf(true);
		}
	},
	{
		id: 'commonprefix-first',
		whichString: "first with same prefix",
		fn: (files: TFile[], current: number, length: number, settings: NavigatorSettings) => indexOfPrevNextWithCommonPrefix(files, current, length, settings, false)
	},
	{
		id: 'commonprefix-last',
		whichString: "last with same prefix",
		fn: (files: TFile[], current: number, length: number, settings: NavigatorSettings) => indexOfPrevNextWithCommonPrefix(files, current, length, settings, true)
	},
];

export default class NavigatorPlugin extends Plugin {
	settings: NavigatorSettings;

	async onload() {
		console.log('Loading Obsidian Navigator');

		await this.loadSettings();

		// Add a settings tab
		this.addSettingTab(new NavigatorSettingTab(this.app, this));

		// Create all possible commands
		SORTING_METHODS.forEach(sortingMethod => {
			MOVEMENT_METHODS.forEach(movementMethod => {
				this.addCommand({
					id: 'navigator-folder-' + movementMethod.id + '-' + sortingMethod.id,
					name: 'By ' + sortingMethod.byString + ': Open ' + movementMethod.whichString + ' in folder',
					checkCallback: (checking: boolean) => this.cmdOpenNoteInFolder(checking, sortingMethod.fn, movementMethod.fn)
				});
			});
		});

		//TODO: remove this when shichongrui/obsidian-reveal-active-file wakes up
		this.app.workspace.on('file-open', () => {
			if(this.settings.autoRevealFileInExplorer) {
				this.app.commands.executeCommandById('file-explorer:reveal-active-file');
			}
		});
	}

	onunload() {
		console.log('Unloading Obisdian Navigator');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	async saveSettings() {
		await this.saveData(this.settings);
	}

	cmdOpenNoteInFolder(checking: boolean, sortingFn: (a: TFile, b: TFile) => number, movementFn: (files: TFile[], current: number, length: number, settings: NavigatorSettings) => number) {
		let leaf = this.app.workspace.activeLeaf;
		if(!leaf) return false;
		let file = this.app.workspace.getActiveFile();
		if(!file) return false;
		let folder = file.parent;
		if(!folder) return false;

		if(!checking) {
			let files = folder.children.filter(file => {
				if(!(file instanceof TFile)) return false;
				let f = file as TFile;
				if(f.extension !== 'md') return false;
				return true;
			}) as TFile[];
			files = files.sort(sortingFn);
			let idx = files.indexOf(file);
			idx = movementFn(files, idx, files.length, this.settings);
			if(idx < 0 || idx >= files.length) return true;
			leaf.openFile(files[idx]);
		}

		return true;
	}
}

class NavigatorSettingTab extends PluginSettingTab {
	plugin: NavigatorPlugin;

	constructor(app: App, plugin: NavigatorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() : void {
		let {containerEl} = this;

		containerEl.empty();
		
		new Setting(containerEl)
			.setName('Today date format')
			.setDesc("Will look for this date format in the title when navigating Today notes")
			.addMomentFormat(mfmt => mfmt
				.setDefaultFormat(DEFAULT_SETTINGS.todayDateFormat)
				.setValue(this.plugin.settings.todayDateFormat)
				.onChange(async (value) => {
					this.plugin.settings.todayDateFormat = value;
					await this.plugin.saveSettings();
				}));
		
		containerEl.createEl('h3', {text: 'Notes with same prefix'});

		new Setting(containerEl)
			.setName('Separators')
			.setDesc("Characters used to tokenize the common prefix (if empty, looks for all characters)")
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.commonPrefixSeparators)
				.setValue(this.plugin.settings.commonPrefixSeparators)
				.onChange(async (value) => {
					this.plugin.settings.commonPrefixSeparators = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Extend search')
			.setDesc("Whether to look for the previous/next note if at the first/last note already")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.commonPrefixExtendSearch)
				.onChange(async (value) => {
					this.plugin.settings.commonPrefixExtendSearch = value;
					await this.plugin.saveSettings();
				}));
		
		containerEl.createEl('h3', {text: 'Extra'});
		new Setting(containerEl)
			.setName('Auto-reveal files in file explorer')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoRevealFileInExplorer)
				.onChange(async (value) => {
					this.plugin.settings.autoRevealFileInExplorer = value;
					await this.plugin.saveSettings();
				}));
	}
}

import { Plugin, TFile } from "obsidian";
import { NavigatorSettings, DEFAULT_SETTINGS, NavigatorCommandPattern } from "./settings";
import { MOVEMENT_METHODS } from "./movement_methods";
import { SORTING_METHODS } from "./sorting_methods";
import { NavigatorMovementMethodFn, NavigatorSortingMethodFn, commandPatternExpand, filesWithCommandPattern } from "./util";
import { NavigatorSettingTab } from "./settings_tab";

export default class NavigatorPlugin extends Plugin {
	settings: NavigatorSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new NavigatorSettingTab(this.app, this));

		// Create all possible navigation commands
		SORTING_METHODS.forEach(sortingMethod => {
			MOVEMENT_METHODS.forEach(movementMethod => {
				this.addCommand({
					id: 'navigator-folder-' + movementMethod.id + '-' + sortingMethod.id,
					name: 'By ' + sortingMethod.byString + ': Open ' + movementMethod.whichString + ' in folder',
					checkCallback: (checking: boolean) => this.cmdOpenNoteInFolder(checking, sortingMethod.fn, movementMethod.fn)
				});
			});
		});

		// Create Last/New commands
		for(let pattern of this.settings.commandPatterns) {
			this.addCommand({
				id: 'navigator-lastnew-' + pattern.id,
				name: 'Last/New ' + pattern.name,
				callback: () => {
					let p = commandPatternExpand(pattern.pattern, this.settings);
					this.openOrCreateFile(p);
				}
			});
			this.addCommand({
				id: 'navigator-last-' + pattern.id,
				name: 'Last ' + pattern.name,
				callback: () => {
					this.cmdOpenLastFileWithPattern(pattern);
				}
			});
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	protected cmdOpenNoteInFolder(checking: boolean, sortingFn: NavigatorSortingMethodFn, movementFn: NavigatorMovementMethodFn) {
		let thisFile = this.app.workspace.getActiveFile();
		if(!thisFile) return false;
		let folder = thisFile.parent;
		if(!folder) return false;

		if(!checking) {
			let files = folder.children.filter(file => {
				if(!(file instanceof TFile)) return false;
				let f = file as TFile;
				if(this.settings.useSameExtension && f.extension !== thisFile?.extension) return false;
				return true;
			}) as TFile[];
			files = files.sort(sortingFn);
			
			let idx = files.indexOf(thisFile);
			idx = movementFn(files, idx, files.length, this.settings);
			if(idx < 0 || idx >= files.length) return true;
			
			this.app.workspace.openLinkText(files[idx].path, '', false);
		}

		return true;
	}

	protected cmdOpenLastFileWithPattern(pattern: NavigatorCommandPattern) {
		let files = this.app.vault.getFiles();
		let filesWithPattern = filesWithCommandPattern(files, pattern.pattern, this.settings.todayDateFormat);
		if(!filesWithPattern.length) return;

		filesWithPattern = filesWithPattern.sort((a, b) => a.basename.localeCompare(b.basename));
		this.app.workspace.openLinkText(filesWithPattern[0].path, '', false);
	}

	protected async openOrCreateFile(path: string) {
		this.app.workspace.openLinkText(path, '', false);
	}
}
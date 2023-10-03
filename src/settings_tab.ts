import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import NavigatorPlugin from "./main";
import { DEFAULT_SETTINGS, NavigatorCommandPattern } from "./settings";
import { commandPatternExpand } from "./util";

export class NavigatorSettingTab extends PluginSettingTab {
	plugin: NavigatorPlugin;
	
	constructor(app: App, plugin: NavigatorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	
	display() {
		let { containerEl } = this;
		
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
		
		containerEl.createEl('h3', { text: 'Notes with same prefix' });

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
		
		new Setting(containerEl)
			.setName('Use the same extension')
			.setDesc("Whether to ignore files with different extensions")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useSameExtension)
				.onChange(async (value) => {
					this.plugin.settings.useSameExtension = value;
					await this.plugin.saveSettings();
				}));
		
		containerEl.createEl('h3', { text: 'Last/New commands' });

		containerEl.createEl('p', { text: 'You can define commands that will open the last or a new note following a particular pattern.' });
		containerEl.createEl('p', { text: "The character '#' will be replaced by today's date" });
		containerEl.createEl('p', { text: 'You will need to restart Obsidian before you can use the commands defined here.' });

		let patternDiv = containerEl.createDiv();
		for(let pattern of this.plugin.settings.commandPatterns) {
			this.createCommandPatternSetting(patternDiv, pattern);
		}

		new Setting(containerEl)
			.addButton(button => button
				.setButtonText('Add pattern')
				.onClick(async () => {
					const pattern: NavigatorCommandPattern = {
						id: crypto.randomUUID(),
						name: 'New pattern',
						pattern: 'Untitled #'
					};
					this.plugin.settings.commandPatterns.push(pattern);
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}

	protected createCommandPatternSetting(containerEl: HTMLElement, pattern: NavigatorCommandPattern) {
		let s = new Setting(containerEl);
		s.setName("Pattern");
		s.setDesc("Example: " + commandPatternExpand(pattern.pattern, this.plugin.settings));
		s.addText(text => text
			.setPlaceholder("Name")
			.setValue(pattern.name)
			.onChange(async (value) => {
				pattern.name = value;
				await this.plugin.saveSettings();
			})
		);
		s.addText(text => text
			.setPlaceholder("Pattern")
			.setValue(pattern.pattern)
			.onChange(async (value) => {
				pattern.pattern = value;
				await this.plugin.saveSettings();
				s.setDesc("Example: " + commandPatternExpand(pattern.pattern, this.plugin.settings));
			})
		);
		s.addExtraButton(button => button
			.setIcon('trash')
			.onClick(async () => {
				this.plugin.settings.commandPatterns.remove(pattern);
				await this.plugin.saveSettings();
				this.display();
			})
		);
	}
}
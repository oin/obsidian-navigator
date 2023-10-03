import { TFile } from "obsidian";
import { NavigatorSettings } from "./settings";
import { indexOfPrevNextWithCommonPrefix } from "./util";

export const MOVEMENT_METHODS = [
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
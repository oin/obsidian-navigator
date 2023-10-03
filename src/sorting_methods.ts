import { TFile } from "obsidian";

export const SORTING_METHODS = [
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
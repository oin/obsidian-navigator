import { TFile } from "obsidian";
import { NavigatorSettings } from "./settings";
import * as moment from "moment";

/**
 * Split a string using a list of possible separators.
 */
export function multisplit(str: string, separators: string[]) {
	if(!separators.length) return str.split('');

	let sep = separators[0];
	for(let i=1; i<separators.length; ++i) {
		str = str.split(separators[i]).join(sep);
	}
	return str.split(sep);
}

/**
 * Find the longest common prefix between a reference string and a list of other strings, given a string of separator characters.
 */
export function longestCommonPrefixWithSeparators(reference: string, others: string[], separators: string) {
	if(!others.length) return '';

	let pieces = multisplit(reference, separators.split(''));
	let lastPrefix = '';
	for(let i=0; i<pieces.length; ++i) {
		let prefix = lastPrefix + (i == 0? '' : reference[lastPrefix.length]) + pieces[i];
		if(others.filter(str => str !== prefix && str.startsWith(prefix)).length == 0) {
			return lastPrefix;
		}
		lastPrefix = prefix;
	}

	return reference;
}

/**
 * @return The index of the next or previous file in a file list that shares a common prefix with the current file, or the current file if no such file exists.
 */
export function indexOfPrevNextWithCommonPrefix(files: TFile[], current: number, length: number, settings: NavigatorSettings, isNext: boolean): number {
	let strFiles = files.map(f => f.basename);
	let reference = files[current].basename;
	let prefix = longestCommonPrefixWithSeparators(reference, strFiles, settings.commonPrefixSeparators);
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

export type NavigatorSortingMethodFn = (a: TFile, b: TFile) => number;
export type NavigatorMovementMethodFn = (files: TFile[], current: number, length: number, settings: NavigatorSettings) => number;

export function todayStr(format?: string) {
	if(!format) {
		format = "YYYY-MM-DD";
	}
	return window.moment(new Date()).format(format);
}

export function filesWithCommandPattern(files: TFile[], pattern: string, dateFormat: string): TFile[] {
	const decomposedPattern = pattern.split('#');
	if(decomposedPattern.length < 1) return [];

	const patternPrefix = decomposedPattern[0];
	const patternSuffix = decomposedPattern.length > 1? decomposedPattern[1] : "";
    return files.filter((file) => {
		const m = window.moment(file.path, dateFormat);
		if(!m.isValid()) return false;
		const unused = m.parsingFlags().unusedInput;
		if(unused.length != 2) return false
		;
		const [prefix, suffix] = unused;
        return prefix.endsWith(patternPrefix) && suffix.startsWith(patternSuffix);
    });
}

export function commandPatternExpand(pattern: string, settings: NavigatorSettings) : string {
	const decomposedPattern = pattern.split('#')
	if(decomposedPattern.length < 2) return pattern;

	// Check number of # in pattern
	const patternPrefix = decomposedPattern[0];
	const patternSuffix = decomposedPattern[1];
	return patternPrefix + todayStr(settings.todayDateFormat) + patternSuffix;
}

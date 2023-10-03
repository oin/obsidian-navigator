export interface NavigatorCommandPattern {
	id: string;
	name: string;
	pattern: string;
};

export interface NavigatorSettings {
	commonPrefixSeparators: string;
	commonPrefixExtendSearch: boolean;
	todayDateFormat: string;
	useSameExtension: boolean
	commandPatterns: NavigatorCommandPattern[];
};

export const DEFAULT_SETTINGS: NavigatorSettings = {
	commonPrefixSeparators: '-:_+ /,;?!',
	commonPrefixExtendSearch: true,
	todayDateFormat: 'YYYY-MM-DD',
	useSameExtension: true,
	commandPatterns: []
};
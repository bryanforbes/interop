import { WidgetProperties } from '@dojo/framework/widget-core/interfaces';

export enum SelectionMode {
	none = 'none',
	multiple = 'multiple',
	single = 'single',
	extended = 'extended'
}

export interface Selections {
	[id: string]: boolean;
}

export interface DgridWrapperFeatures {
	// Setting pagination to true turns off infinite scrolling and displays rows in discrete pages.
	pagination?: boolean;
	// Add keyboard navigation capability.
	keyboard?: boolean;
	// Add selection capabilities to a grid.
	selection?: SelectionType;
	// Support hierarchical data
	// When tree is enabled, the items in the data array are expected to have the following properties:
	//  - hasChildren: boolean, true indicates this item has children
	//  - parent: ID, if this item is a child, parent is the ID of the parent item.
	tree?: boolean;
}

export interface DgridWrapperProperties extends WidgetProperties {
	features?: DgridWrapperFeatures;

	// Grid properties
	columns?: ColumnSpec;
	subRows?: Array<Column[]>;

	// An array of data items that will be pushed into a Memory store and passed to the dgrid grid.
	data: {}[];

	// _StoreMixin properties
	// See https://github.com/SitePen/dgrid/blob/master/_StoreMixin.js for documenation and default values.
	noDataMessage?: string;
	loadingMessage?: string;

	// Pagination properties
	// See https://github.com/SitePen/dgrid/blob/master/extensions/Pagination.js for documenation and default values.
	rowsPerPage?: number;
	pagingTextBox?: boolean;
	previousNextArrows?: boolean;
	firstLastArrows?: boolean;
	pagingLinks?: number;
	pageSizeOptions?: number[];
	showLoadingMessage?: boolean;

	// Keyboard properties
	// See https://github.com/SitePen/dgrid/blob/master/Keyboard.js for documenation and default values.
	pageSkip?: number;
	tabIndex?: number;

	// Selection properties
	// See https://github.com/SitePen/dgrid/blob/master/Selection.js for documenation and default values.
	deselectOnRefresh?: boolean;
	allowSelectAll?: boolean;
	selection?: Selections;
	selectionMode?: SelectionMode;
	allowTextSelection?: boolean;
	onSelect?: (selected: SelectionData, selections: Selections) => void;
	onDeselect?: (deselected: SelectionData, selections: Selections) => void;

	// Tree properties
	collapseOnRefresh?: boolean;
	enableTreeTransitions?: boolean;
	treeIndentWidth?: number;
}

// List of dgrid property names that must be passed to dgrid when a grid is constructed.
// These keys can not update an existing grid.  If they change, a new grid must be constructed.
export const constructionKeys = [
	'previousNextArrows',
	'firstLastArrows',
	'pagingLinks',
	'tabIndex',
	'allowSelectAll',
	'selection',
	'treeIndentWidth'
];

export interface Column {
	field?: string;
	id?: string | number;
	label?: string;
	className?: string;
	colSpan?: number;
	rowSpan?: number;
	sortable?: boolean;
	formatter?: string | Formatter;

	get?(item: any): any;
	set?(item: any): any;
	renderCell?(object: any, value: any, node: HTMLElement): HTMLElement | void;
	renderHeaderCell?(node: HTMLElement): HTMLElement | void;
}

export type ColumnSpec = { [key: string]: Column | string } | Column[];

export type Formatter = (value: any, object: any) => string;

export enum SelectionType {
	row = 'row',
	cell = 'cell'
}

export interface SelectionData {
	type: SelectionType;
	data: {
		// The data item used to render the selected row.
		item: any;
		// If the type is "cell", this contains the field name that corresponds to the selected cell.
		field?: string;
	}[];
}

export default DgridWrapperProperties;

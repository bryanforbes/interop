import { WidgetProperties } from '@dojo/framework/widget-core/interfaces';

export interface DgridWrapperProperties extends WidgetProperties {
	features?: {
		// Setting pagination to true turns off infinite scrolling and displays rows in discrete pages.
		pagination?: boolean;
	};

	// Grid properties
	columns?: ColumnSpec;
	subRows?: Array<Column[]>;

	// An array of data items that will be pushed into a Memory store and passed to the dgrid grid.
	data: {}[];

	// _StoreMixin properties
	noDataMessage?: string;
	loadingMessage?: string;

	// Pagination properties
	rowsPerPage?: number;
	pagingTextBox?: boolean;
	previousNextArrows?: boolean;
	firstLastArrows?: boolean;
	pagingLinks?: number;
	pageSizeOptions?: number[];
	showLoadingMessage?: boolean;
}

// List of dgrid property names that must be passed to dgrid when a grid is constructed.
// These keys can not update an existing grid.  If they change, a new grid must be constructed.
export const constructionKeys = ['previousNextArrows', 'firstLastArrows', 'pagingLinks'];

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

export default DgridWrapperProperties;

import { dom } from '@dojo/framework/widget-core/d';
import { DNode } from '@dojo/framework/widget-core/interfaces';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import { duplicate } from '@dojo/core/lang';
import { DgridWrapperProperties, SelectionData, SelectionType } from './DgridWrapperProperties';
import * as Grid from 'dgrid/Grid';
import * as StoreMixin from 'dgrid/_StoreMixin';
import * as OnDemandGrid from 'dgrid/OnDemandGrid';
import * as Keyboard from 'dgrid/Keyboard';
import * as Pagination from 'dgrid/extensions/Pagination';
import * as Selection from 'dgrid/Selection';
import { DgridInnerWrapperProperties } from './DgridInnerWrapperProperties';
import { buildConstructor, buildCollection } from './dgridConstructorFactory';

interface DgridSelectionEvent extends Event {
	rows?: { data: any }[];
	cells?: { data: any }[];
}

/**
 * When a dgrid grid is destroyed some of its state will need to be restored when the next
 * grid is created.  This interface describes that state.
 */
export interface DgridState {
	currentPage?: number;
}

interface DgridGrid extends Grid, Pagination, Keyboard, Selection {}

function buildSelectEvent(event: DgridSelectionEvent): SelectionData {
	const selectionType = event.rows ? SelectionType.row : SelectionType.cell;
	const data: SelectionData = {
		type: selectionType,
		data: []
	};
	if (selectionType === SelectionType.row) {
		event.rows &&
			(data.data = event.rows.map((rowData: any) => {
				return {
					item: rowData.data
				};
			}));
	} else {
		event.cells &&
			(data.data = event.cells.map((cellData: any) => {
				return {
					item: cellData.row.data,
					field: cellData.column.field
				};
			}));
	}

	return data;
}

/**
 * Wrap a dgrid widget, so that it can exist inside of the Dojo 2 widgeting system.
 *
 * This widget will construct a dgrid widget based on DgridProperties but it will only react to
 * changes in DgridProperties#data.  If the other properties change, then this widget will need
 * to be destroyed and a new one created.
 */
export class DgridInnerWrapper extends WidgetBase<DgridInnerWrapperProperties> {
	private grid: DgridGrid;

	protected render(): DNode | DNode[] {
		let grid = this.grid;
		if (!grid) {
			grid = this.grid = this.initGrid();
			this.registerGridEvents();
		} else {
			this.setChangedGridProperites();
		}
		return dom({ node: grid.domNode });
	}

	protected onAttach(): void {
		const grid = this.grid;
		const handle = grid.on('dgrid-refresh-complete', () => {
			handle.remove();
			this.restoreGridState();
		});
		grid.startup();
	}

	protected onDetach(): void {
		this.grid && this.grid.destroy();
	}

	private emitGridState(): void {
		this.properties.onGridState({
			currentPage: this.grid._currentPage
		});
	}

	private initGrid(): DgridGrid {
		const Constructor = buildConstructor(this.properties, this.emitGridState.bind(this));
		return new Constructor(this.filterProperties(this.properties));
	}

	private restoreGridState() {
		const { gridState } = this.properties;
		if (gridState) {
			const { currentPage } = gridState;
			if (currentPage && currentPage > 1 && this.grid.gotoPage) {
				this.grid.gotoPage(currentPage);
			}
		}
	}

	private filterProperties(properties: DgridWrapperProperties): DgridProperties {
		// Remove DgridWrapperProperties properties not used by dgrid.
		const newProperties = { ...properties } as any;
		delete newProperties.features;
		if (newProperties.data != null) {
			newProperties.collection = buildCollection(newProperties, this.properties.features);
		}
		if (newProperties.columns != null) {
			newProperties.columns = duplicateColumnDef(newProperties.columns);
		}
		if ('selection' in newProperties && newProperties.selection == null) {
			newProperties.selection = {};
		}
		return newProperties;
	}

	private setChangedGridProperites(): void {
		// Set only the properties that changed to minimize how much DOM dgrid rebuild.
		const properties: any = this.properties;
		const changeProperties: any = {};
		this.changedPropertyKeys.forEach((key) => {
			changeProperties[key] = properties[key];
		});
		this.grid && this.grid.set(this.filterProperties(changeProperties));
	}

	private registerGridEvents(): void {
		const properties = this.properties;
		if (properties.features) {
			const { selection } = properties.features;
			if (selection) {
				const grid = this.grid;
				grid.on('dgrid-select', (event: DgridSelectionEvent) => {
					const onSelect = properties.onSelect;
					onSelect && onSelect(buildSelectEvent(event), grid.selection);
				});
				grid.on('dgrid-deselect', (event: DgridSelectionEvent) => {
					const onDeselect = properties.onDeselect;
					onDeselect && onDeselect(buildSelectEvent(event), grid.selection);
				});
			}
		}
	}
}

function duplicateColumnDef(columnsSpec: Grid.ColumnSpec): Grid.ColumnSpec {
	if (Array.isArray(columnsSpec)) {
		if (columnsSpec.length === 0) {
			return [];
		}
		return columnsSpec.map((columnSpec) => {
			return duplicate(columnSpec);
		});
	} else {
		return duplicate(columnsSpec);
	}
}

interface DgridProperties extends Grid.KwArgs, StoreMixin.KwArgs, Pagination.KwArgs, OnDemandGrid.KwArgs {}

export default DgridInnerWrapper;

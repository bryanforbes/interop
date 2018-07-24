import { dom } from '@dojo/widget-core/d';
import { VNode } from '@dojo/widget-core/interfaces';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { duplicate } from '@dojo/core/lang';
import { DgridWrapperProperties } from './DgridWrapperProperties';
import * as declare from 'dojo/_base/declare';
import * as Grid from 'dgrid/Grid';
import * as StoreMixin from 'dgrid/_StoreMixin';
import * as OnDemandGrid from 'dgrid/OnDemandGrid';
import * as Pagination from 'dgrid/extensions/Pagination';
import * as MemoryStore from 'dstore/Memory';

/**
 * When a dgrid grid is destroyed some of its state will need to be restored when the next
 * grid is created.  This interface describes that state.
 */
export interface DgridState {
	currentPage?: number;
}

export interface DgridInnerWrapperProperties extends DgridWrapperProperties {
	// The inner wrapper can pass a state object to the outer wrapper widget so
	// a dgrid grid can be destroyed and recreated back to the same state when
	// desired.
	gridState?: DgridState;
	onGridState?: (state: DgridState) => void;
}

interface DgridGrid extends Grid, Pagination {}

/**
 * Wrap a dgrid widget, so that it can exist inside of the Dojo 2 widgeting system.
 *
 * This widget will construct a dgrid widget based on DgridProperties but it will only react to
 * changes in DgridProperties#data.  If the other properties change, then this widget will need
 * to be destroyed and a new one created.
 */
export class DgridInnerWrapper extends WidgetBase<DgridInnerWrapperProperties> {
	private grid: DgridGrid;

	protected render(): VNode {
		let grid = this.grid;
		if (!grid) {
			grid = this.grid = this.initGrid();
		} else {
			this.setChangedGridProperites();
		}
		return dom({ node: grid.domNode });
	}

	protected onAttach(): void {
		const grid = this.grid;
		if (grid) {
			const handle = grid.on('dgrid-refresh-complete', () => {
				handle.remove();
				this.restoreGridState();
			});
			grid.startup();
		}
	}

	protected onDetach(): void {
		this.grid && this.grid.destroy();
	}

	private emitGridState(): void {
		const { onGridState } = this.properties;
		const grid = this.grid;
		if (grid) {
			if (onGridState) {
				const gridState: DgridState = {};
				if (grid.gotoPage) {
					gridState.currentPage = grid._currentPage;
				}
				onGridState(gridState);
			}
		}
	}

	private initGrid(): DgridGrid {
		const Constructor = this.buildConstructor();
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

	private buildConstructor() {
		let pagination;
		const features = this.properties.features;
		if (features) {
			pagination = features.pagination;
		}
		const emitGridState = this.emitGridState.bind(this);

		let Constructor;
		if (pagination) {
			Constructor = declare([Grid, Pagination] as any, {
				_updateNavigation: function _updateNavigation(total: number) {
					this.inherited(_updateNavigation, arguments);
					emitGridState();
				}
			});
		} else {
			Constructor = declare([OnDemandGrid] as any);
		}
		return Constructor;
	}

	private filterProperties(properties: DgridWrapperProperties): DgridProperties {
		// Remove DgridWrapperProperties properties not used by dgrid.
		const newProperties = { ...properties } as any;
		delete newProperties.features;
		if (newProperties.data != null) {
			newProperties.collection = new MemoryStore({ data: this.properties.data });
		}
		if (newProperties.columns != null) {
			newProperties.columns = duplicateColumnDef(newProperties.columns);
		}
		return newProperties;
	}

	private setChangedGridProperites(): void {
		// Set only the properties that changed to minimize how much DOM dgrid rebuild.
		const properties: any = this.properties;
		const changeProperties: any = {};
		this.changedPropertyKeys.forEach((key) => {
			const value = properties[key];
			if (value != null) {
				changeProperties[key] = value;
			}
		});
		this.grid && this.grid.set(this.filterProperties(changeProperties));
	}
}

function duplicateColumnDef(columnsSpec: Grid.ColumnSpec): Grid.ColumnSpec {
	if (columnsSpec == null) {
		return columnsSpec;
	}
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

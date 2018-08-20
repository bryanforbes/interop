import { dom } from '@dojo/framework/widget-core/d';
import { VNode } from '@dojo/framework/widget-core/interfaces';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import { duplicate } from '@dojo/core/lang';
import { DgridWrapperProperties } from './DgridWrapperProperties';
import * as Grid from 'dgrid/Grid';
import * as StoreMixin from 'dgrid/_StoreMixin';
import * as OnDemandGrid from 'dgrid/OnDemandGrid';
import * as Keyboard from 'dgrid/Keyboard';
import * as Pagination from 'dgrid/extensions/Pagination';
import * as MemoryStore from 'dstore/Memory';
import { DgridInnerWrapperProperties } from './DgridInnerWrapperProperties';
import { buildConstructor } from './dgridConstructorFactory';

/**
 * When a dgrid grid is destroyed some of its state will need to be restored when the next
 * grid is created.  This interface describes that state.
 */
export interface DgridState {
	currentPage?: number;
}

interface DgridGrid extends Grid, Pagination, Keyboard {}

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
			changeProperties[key] = properties[key];
		});
		this.grid && this.grid.set(this.filterProperties(changeProperties));
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

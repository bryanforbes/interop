import { dom } from '@dojo/widget-core/d';
import { VNode } from '@dojo/widget-core/interfaces';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import * as declare from 'dojo/_base/declare';
import * as Grid from 'dgrid/Grid';
import * as Pagination from 'dgrid/extensions/Pagination';
import * as MemoryStore from 'dstore/Memory';

export interface DgridWrapperProperties {
	data: {}[];
	columns: {}[];
}

/**
 * Wrap a Dojo 1 Dijit, so that it can exist inside of the Dojo 2 widgeting system.
 * @param Dijit The constructor function for the Dijit
 * @param tagName The tag name that should be used when creating the DOM for the dijit. Defaults to `div`.
 */
class DgridWrapper extends WidgetBase<DgridWrapperProperties> {
	private _grid: Grid | undefined;
	private _node: HTMLElement | undefined;

	private _updateGrid(data: {}[]) {
		// not null assertion, because this can only be called when `_dijit` is assigned
		this._grid!.get('collection').setData(data);
	}

	protected render(): VNode {
		const { data } = this.properties;
		if (this._grid) {
			this._updateGrid(data);
		} else {
			this.initGrid();
		}

		return dom({ node: this._node! });
	}

	protected onAttach(): void {
		this._grid && this._grid.startup();
	}

	protected onDetach(): void {
		this._grid && this._grid.destroy();
	}

	public initGrid() {
		this._node = document.createElement('div');
		const Constructor = declare([Grid, Pagination] as any);
		this._grid = new Constructor(
			{
				collection: new MemoryStore({ data: this.properties.data }),
				columns: this.properties.columns
			},
			this._node
		);
	}
}

export default DgridWrapper;

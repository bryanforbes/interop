import { v } from '@dojo/widget-core/d';
import { VNode } from '@dojo/widget-core/interfaces';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import afterRender from '@dojo/widget-core/decorators/afterRender';
import Base from '@dojo/widget-core/meta/Base';
import * as dgrid from 'dgrid';
import * as dstore from 'dojo-dstore';

/**
 * An internal meta provider that provides the rendered DOM node on _root_ Dijits
 */
class DomNode extends Base {
	public get(key: string | number) {
		return this.getNode(key);
	}
}

/**
 * Internal `key` constant
 */
const DEFAULT_KEY = 'root';

export interface DgridWrapperProperties<T> {
	data: T[];
	columns: {}[];
}

/**
 * Wrap a Dojo 1 Dijit, so that it can exist inside of the Dojo 2 widgeting system.
 * @param Dijit The constructor function for the Dijit
 * @param tagName The tag name that should be used when creating the DOM for the dijit. Defaults to `div`.
 */
class DgridWrapper<T = {}> extends WidgetBase<DgridWrapperProperties<T>> {
	private _grid: dgrid.Pagination<T> | undefined;
	private _node: HTMLElement | undefined;

	private _updateGrid(data: T[]) {
		// not null assertion, because this can only be called when `_dijit` is assigned
		this._grid!.setData(data);
	}

	protected render(): VNode {
		const { key = DEFAULT_KEY, data } = this.properties;
		if (this._grid) {
			this._updateGrid(data);
		}

		return v('div', { key });
	}

	protected onDetach(): void {
		this._grid && this._grid.destroy();
	}

	@afterRender()
	public initGrid() {
		this._node = this.meta(DomNode).get('root') as HTMLElement;
		this._grid = new dgrid.Pagination(
			{
				collection: new dstore.MemoryStore({ data: this.properties.data }),
				columns: this.properties.columns
			},
			this._node
		);
	}
}

export default DgridWrapper;

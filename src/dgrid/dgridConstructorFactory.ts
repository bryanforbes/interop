import { DgridInnerWrapperProperties } from './DgridInnerWrapperProperties';
import * as declare from 'dojo/_base/declare';
import * as Grid from 'dgrid/Grid';
import * as OnDemandGrid from 'dgrid/OnDemandGrid';
import * as Keyboard from 'dgrid/Keyboard';
import * as Pagination from 'dgrid/extensions/Pagination';
import * as Selection from 'dgrid/Selection';
import * as CellSelection from 'dgrid/CellSelection';
import * as Tree from 'dgrid/Tree';
import { SelectionType } from './DgridWrapperProperties';

export function buildConstructor(properties: DgridInnerWrapperProperties, emitGridState: () => void): any {
	const { pagination, keyboard, selection, tree } = properties.features || {
		pagination: false,
		keyboard: false,
		selection: undefined,
		tree: false
	};

	let mixins: any = [];
	let overrides: any = {};
	if (pagination) {
		mixins.push(Grid);
		mixins.push(Pagination);

		overrides._updateNavigation = function _updateNavigation(total: number) {
			this.inherited(_updateNavigation, arguments);
			emitGridState();
		};
	} else {
		mixins.push(OnDemandGrid);
	}

	if (tree) {
		mixins.push(Tree);
	}

	if (keyboard) {
		mixins.push(Keyboard);
	}

	if (selection) {
		mixins.push(selection === SelectionType.row ? Selection : CellSelection);
	}

	return declare(mixins as any, overrides);
}

export default buildConstructor;

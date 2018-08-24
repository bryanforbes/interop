import { DgridInnerWrapperProperties } from './DgridInnerWrapperProperties';
import * as declare from 'dojo/_base/declare';
import * as Grid from 'dgrid/Grid';
import * as OnDemandGrid from 'dgrid/OnDemandGrid';
import * as Keyboard from 'dgrid/Keyboard';
import * as Pagination from 'dgrid/extensions/Pagination';
import * as Selection from 'dgrid/Selection';
import * as CellSelection from 'dgrid/CellSelection';
import * as Tree from 'dgrid/Tree';
import { DgridWrapperFeatures, SelectionType } from './DgridWrapperProperties';
import * as MemoryStore from 'dstore/Memory';
import * as TreeStore from 'dstore/Tree';
import * as Trackable from 'dstore/Trackable';

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

export function buildCollection(properties: any, features?: DgridWrapperFeatures): any {
	const treeEnabled = features && features.tree;
	let mixins: any = [MemoryStore, Trackable];
	let overrides: any = {};

	if (treeEnabled) {
		mixins.push(TreeStore);
		overrides.getRootCollection = function() {
			return this.root.filter((item: any) => {
				return item.parent == null;
			});
		};
	}

	const Store = declare(mixins as any, overrides);
	let collection = new Store({
		data: properties.data
	});
	if (treeEnabled) {
		collection = collection.getRootCollection();
	}
	return collection;
}

export default buildConstructor;

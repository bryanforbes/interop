import { DgridInnerWrapperProperties } from './DgridInnerWrapperProperties';
import * as declare from 'dojo/_base/declare';
import * as Grid from 'dgrid/Grid';
import * as OnDemandGrid from 'dgrid/OnDemandGrid';
import * as Keyboard from 'dgrid/Keyboard';
import * as Pagination from 'dgrid/extensions/Pagination';

export function buildConstructor(properties: DgridInnerWrapperProperties, emitGridState: () => void): any {
	const { pagination, keyboard } = properties.features || {
		pagination: false,
		keyboard: false
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

	if (keyboard) {
		mixins.push(Keyboard);
	}

	return declare(mixins as any, overrides);
}

export default buildConstructor;

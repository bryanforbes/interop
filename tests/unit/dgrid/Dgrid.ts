const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

import harness from '@dojo/test-extras/harness';
import DgridWrapper from '../../../src/dgrid/DgridWrapper';
import DgridWrapperProperties from '../../../src/dgrid/DgridWrapperProperties';
import { DgridInnerWrapperProperties } from '../../../src/dgrid/DgridInnerWrapper';

import { w } from '@dojo/widget-core/d';
import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { ColumnSpec } from 'dgrid/Grid';

registerSuite('dgrid/Dgrid VDOM', {
	'basic vdom render'() {
		const h = harness(() =>
			w(DgridWrapper, {
				data: [],
				columns: {
					first: 'First',
					last: 'Last'
				},
				features: {
					pagination: true
				}
			})
		);
		h.expect(() =>
			w('DgridInnerWrapper', {
				data: [],
				key: 'dgridWrapper0',
				columns: {
					first: 'First',
					last: 'Last'
				},
				gridState: undefined,
				onGridState: () => {},
				features: {
					pagination: true
				}
			} as DgridInnerWrapperProperties)
		);
	},

	'property update - no key change expected'() {
		const properties: DgridWrapperProperties = {
			data: [],
			columns: {
				first: 'First',
				last: 'Last'
			},
			features: {
				pagination: true
			}
		};
		const h = harness(() => w(DgridWrapper, properties));
		h.expect(() =>
			w('DgridInnerWrapper', {
				data: [],
				key: 'dgridWrapper0',
				columns: {
					first: 'First',
					last: 'Last'
				},
				gridState: undefined,
				onGridState: () => {},
				features: {
					pagination: true
				}
			} as DgridInnerWrapperProperties)
		);
		properties.columns = {
			id: 'ID',
			first: 'First',
			last: 'Last'
		};
		h.expect(() =>
			w('DgridInnerWrapper', {
				data: [],
				key: 'dgridWrapper0',
				columns: {
					id: 'ID',
					first: 'First',
					last: 'Last'
				},
				gridState: undefined,
				onGridState: () => {},
				features: {
					pagination: true
				}
			} as DgridInnerWrapperProperties)
		);
		properties.data = [
			{
				id: 1,
				first: 'first',
				last: 'last'
			}
		];
		h.expect(() =>
			w('DgridInnerWrapper', {
				data: [
					{
						id: 1,
						first: 'first',
						last: 'last'
					}
				],
				key: 'dgridWrapper0',
				columns: {
					id: 'ID',
					first: 'First',
					last: 'Last'
				},
				gridState: undefined,
				onGridState: () => {},
				features: {
					pagination: true
				}
			} as DgridInnerWrapperProperties)
		);
	},

	'property update - key change expected'() {
		const properties: DgridWrapperProperties = {
			data: [],
			columns: {
				first: 'First',
				last: 'Last'
			},
			features: {
				pagination: true
			}
		};
		const h = harness(() => w(DgridWrapper, properties));
		h.expect(() =>
			w('DgridInnerWrapper', {
				data: [],
				key: 'dgridWrapper0',
				columns: {
					first: 'First',
					last: 'Last'
				},
				gridState: undefined,
				onGridState: () => {},
				features: {
					pagination: true
				}
			} as DgridWrapperProperties)
		);
		properties.features = {
			pagination: false
		};
		h.expect(() =>
			w('DgridInnerWrapper', {
				data: [],
				key: 'dgridWrapper1',
				columns: {
					first: 'First',
					last: 'Last'
				},
				gridState: undefined,
				onGridState: () => {},
				features: {
					pagination: false
				}
			} as DgridInnerWrapperProperties)
		);
	}
});

class TestProjector extends ProjectorMixin(WidgetBase) {
	data: any[] = [
		{
			id: 1,
			first: 'first',
			last: 'last'
		}
	];
	columns: ColumnSpec = {
		first: 'First',
		last: 'Last'
	};
	pagination = true;

	render() {
		return w(DgridWrapper, {
			data: this.data,
			columns: this.columns,
			features: {
				pagination: this.pagination
			}
		});
	}
}

registerSuite('dgrid/Dgrid DOM', {
	'basic DOM render'() {
		const projector = new TestProjector();
		projector.sandbox();

		// Check to see if a dgrid grid rendered with pagination.
		const gridNode = projector.root.firstChild! as HTMLElement;
		assert.isNotNull(gridNode);

		const cells = gridNode.querySelectorAll('.dgrid-cell');
		assert.strictEqual(cells.length, 4);

		['First', 'Last', 'first', 'last'].forEach((text, i) => {
			assert.strictEqual(cells[i].textContent, text);
		});

		const paginationNode = gridNode.querySelector('.dgrid-pagination');
		assert.isNotNull(paginationNode);
	},

	'Recreate Grid on property change'() {
		const projector = new TestProjector();
		projector.sandbox();

		// Check to see if a dgrid grid rendered with pagination.
		let gridNode = projector.root.firstChild! as HTMLElement;
		assert.isNotNull(gridNode);
		const gridId = gridNode.id;

		let paginationNode = gridNode.querySelector('.dgrid-pagination');
		assert.isNotNull(paginationNode);

		projector.pagination = false;
		projector.invalidate();

		gridNode = projector.root.firstChild! as HTMLElement;
		assert.notStrictEqual(gridNode.id, gridId);
		const cells = gridNode.querySelectorAll('.dgrid-cell');
		assert.strictEqual(cells.length, 4);

		['First', 'Last', 'first', 'last'].forEach((text, i) => {
			assert.strictEqual(cells[i].textContent, text);
		});

		paginationNode = gridNode.querySelector('.dgrid-pagination');
		assert.isNull(paginationNode);
	},

	'Update Grid on property change'() {
		const projector = new TestProjector();
		projector.sandbox();

		// Check to see if a dgrid grid rendered with pagination.
		let gridNode = projector.root.firstChild! as HTMLElement;
		assert.isNotNull(gridNode);
		const gridId = gridNode.id;

		let cells = gridNode.querySelectorAll('.dgrid-cell');
		assert.strictEqual(cells.length, 4);

		['First', 'Last', 'first', 'last'].forEach((text, i) => {
			assert.strictEqual(cells[i].textContent, text);
		});

		projector.columns = {
			id: 'ID',
			first: 'First',
			last: 'Last'
		};
		projector.invalidate();

		gridNode = projector.root.firstChild! as HTMLElement;
		assert.strictEqual(gridNode.id, gridId);
		cells = gridNode.querySelectorAll('.dgrid-cell');
		assert.strictEqual(cells.length, 6);

		['ID', 'First', 'Last', '1', 'first', 'last'].forEach((text, i) => {
			assert.strictEqual(cells[i].textContent, text);
		});
	}
});

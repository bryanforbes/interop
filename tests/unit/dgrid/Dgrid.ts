const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

import harness from '@dojo/framework/testing/harness';
import DgridWrapper from '../../../src/dgrid/DgridWrapper';
import DgridWrapperProperties from '../../../src/dgrid/DgridWrapperProperties';
import { DgridInnerWrapperProperties } from '../../../src/dgrid/DgridInnerWrapper';

import { w } from '@dojo/framework/widget-core/d';
import { ProjectorMixin } from '@dojo/framework/widget-core/mixins/Projector';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';

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
		properties.columns = [{ field: 'first', label: 'FIRST' }, { field: 'last', label: 'LAST' }];
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
				columns: [{ field: 'first', label: 'FIRST' }, { field: 'last', label: 'LAST' }],
				gridState: undefined,
				onGridState: () => {},
				features: {
					pagination: true
				}
			} as DgridInnerWrapperProperties)
		);
		properties.columns = [{ field: 'first', label: 'fIrSt' }, { field: 'last', label: 'LAST' }];
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
				columns: [{ field: 'first', label: 'fIrSt' }, { field: 'last', label: 'LAST' }],
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
		properties.previousNextArrows = false;
		h.expect(() =>
			w('DgridInnerWrapper', {
				data: [],
				key: 'dgridWrapper2',
				columns: {
					first: 'First',
					last: 'Last'
				},
				gridState: undefined,
				onGridState: () => {},
				features: {
					pagination: false
				},
				previousNextArrows: false
			} as DgridInnerWrapperProperties)
		);
	}
});

class TestProjector extends ProjectorMixin(WidgetBase) {
	testProperties: DgridWrapperProperties = {
		data: [
			{
				id: 1,
				first: 'first',
				last: 'last'
			}
		],
		columns: {
			first: 'First',
			last: 'Last'
		},
		features: {
			pagination: true
		}
	};

	render() {
		return w(DgridWrapper, { ...this.testProperties });
	}
}

let sandbox: HTMLElement;

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

	'basic DOM render - no columns'() {
		const projector = new TestProjector();
		projector.testProperties.columns = [];
		projector.sandbox();

		// Check to see if a dgrid grid rendered with pagination.
		const gridNode = projector.root.firstChild! as HTMLElement;
		assert.isNotNull(gridNode);

		const cells = gridNode.querySelectorAll('.dgrid-cell');
		assert.strictEqual(cells.length, 0);

		const paginationNode = gridNode.querySelector('.dgrid-pagination');
		assert.isNotNull(paginationNode);
	},

	'basic DOM render - null columns'() {
		const projector = new TestProjector();
		projector.testProperties.columns = undefined;
		projector.sandbox();

		// Check to see if a dgrid grid rendered with pagination.
		const gridNode = projector.root.firstChild! as HTMLElement;
		assert.isNotNull(gridNode);

		const cells = gridNode.querySelectorAll('.dgrid-cell');
		assert.strictEqual(cells.length, 0);

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

		delete projector.testProperties.features;
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
		projector.testProperties.columns = [{ field: 'first', label: 'First' }, { field: 'last', label: 'Last' }];
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

		projector.testProperties.columns = [
			{ field: 'id', label: 'ID' },
			{ field: 'first', label: 'First' },
			{ field: 'last', label: 'Last' }
		];
		projector.invalidate();

		gridNode = projector.root.firstChild! as HTMLElement;
		assert.strictEqual(gridNode.id, gridId);
		cells = gridNode.querySelectorAll('.dgrid-cell');
		assert.strictEqual(cells.length, 6);

		['ID', 'First', 'Last', '1', 'first', 'last'].forEach((text, i) => {
			assert.strictEqual(cells[i].textContent, text);
		});
	},

	'DOM Interactions': {
		beforeEach: () => {
			sandbox = document.createElement('div');
			document.body.appendChild(sandbox);
		},

		afterEach: () => {
			document.body.removeChild(sandbox);
		},

		tests: {
			'Restore page 1'() {
				let refreshCount = 0;
				let gridId: string;
				return new Promise((resolve) => {
					sandbox.addEventListener('dgrid-refresh-complete', () => {
						refreshCount++;
						switch (refreshCount) {
							case 1: {
								// Give the grid time to call gotoPage().
								setTimeout(() => {
									let statusNode = document.getElementsByClassName('dgrid-status')[0];
									// Are we on page 2?
									assert.strictEqual(statusNode.textContent, '1 - 5 of 99 results');

									projector.testProperties.previousNextArrows = false;
									projector.invalidate();
								}, 100);
								break;
							}
							case 2: {
								// Give the grid time to call gotoPage().
								setTimeout(() => {
									assert.notEqual(document.getElementsByClassName('dgrid')[0].id, gridId);
									let statusNode = document.getElementsByClassName('dgrid-status')[0];
									// Are we on page 2 again?
									assert.strictEqual(statusNode.textContent, '1 - 5 of 99 results');
									resolve();
								}, 100);
							}
						}
					});
					const projector = new TestProjector();
					for (let i = 2; i < 100; i++) {
						projector.testProperties.data.push({
							id: i,
							first: 'First' + i,
							last: 'Last' + i
						});
					}
					projector.testProperties.rowsPerPage = 5;
					projector.append(sandbox);
				});
			},

			'Restore page 2'() {
				let refreshCount = 0;
				let gridId: string;
				return new Promise((resolve) => {
					sandbox.addEventListener('dgrid-refresh-complete', () => {
						refreshCount++;
						switch (refreshCount) {
							case 1: {
								gridId = document.getElementsByClassName('dgrid')[0].id;
								const found = document.getElementsByClassName('dgrid-next');
								if (found && found.length) {
									(found[0] as HTMLElement).click();
									// Give the grid time to call gotoPage().
									setTimeout(() => {
										let statusNode = document.getElementsByClassName('dgrid-status')[0];
										// Are we on page 2?
										assert.strictEqual(statusNode.textContent, '6 - 10 of 99 results');

										projector.testProperties.previousNextArrows = false;
										projector.invalidate();
									}, 100);
								} else {
									assert.fail('Could not advance grid page.');
								}
								break;
							}
							case 2: {
								// Give the grid time to call gotoPage().
								setTimeout(() => {
									assert.notEqual(document.getElementsByClassName('dgrid')[0].id, gridId);
									let statusNode = document.getElementsByClassName('dgrid-status')[0];
									// Are we on page 2 again?
									assert.strictEqual(statusNode.textContent, '6 - 10 of 99 results');
									resolve();
								}, 100);
							}
						}
					});

					const projector = new TestProjector();
					for (let i = 2; i < 100; i++) {
						projector.testProperties.data.push({
							id: i,
							first: 'First' + i,
							last: 'Last' + i
						});
					}
					projector.testProperties.rowsPerPage = 5;
					projector.append(sandbox);
				});
			}
		}
	}
});

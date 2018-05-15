declare module 'dojo-dstore' {
	export class MemoryStore {
		constructor(props: { data: {}[] });
	}
}

declare module 'dgrid' {
	// import MemoryStore = dstore.MemoryStore;
	export class Grid<T> {
		constructor(
			props: {
				collection: {};
				columns: {}[];
			},
			node: HTMLElement
		);
		setData(data: T[]): void;
		destroy(): void;
	}

	export class OnDemandGrid<T> extends Grid<T> {}

	export class Pagination<T> extends Grid<T> {}
}

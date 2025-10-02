// src/router.js
export class Router {
	constructor() {
		this.routes = {};
	}

	add(method, path, handler) {
		if (!this.routes[path]) {
			this.routes[path] = {};
		}
		this.routes[path][method] = handler;
	}

	async route(request, ...args) {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;

		if (this.routes[path]?.[method]) {
			const handler = this.routes[path][method];
			return await handler(request, ...args);
		}

		// Fallback for routes that were in the switch statement
		if (this.routes[path]?.ANY) {
			return await this.routes[path].ANY(request, ...args);
		}

		return new Response("Not Found", { status: 404 });
	}
}

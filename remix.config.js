import { flatRoutes } from 'remix-flat-routes'

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
	cacheDirectory: './node_modules/.cache/remix',
	ignoredRouteFiles: ['**/*'],
	serverModuleFormat: 'esm',
	serverPlatform: 'node',
	tailwind: true,
	postcss: true,
	watchPaths: ['./tailwind.config.ts'],
	routes: async defineRoutes => {
		return flatRoutes('routes', defineRoutes, {
			ignoredRouteFiles: [
				'.*',
				'**/*.css',
				'**/*.test.{js,jsx,ts,tsx}',
				'**/__*.*',
			],
		})
	},
	browserNodeBuiltinsPolyfill: {
		modules: {
			crypto: true,
			// events: true,
			// url: true,
			// util: true,
			// fs: true,
			// http: true,
			// https: true,
			// zlib: true,
			// stream: true,
			// net: true,
			// dns: true,
			// os: true,
			// path: true,
			// punycode: true,
			// tls: true,
			// child_process: true,
		},
	},
	serverDependenciesToBundle: ['confetti-react'],
}

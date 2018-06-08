import commonjs from "rollup-plugin-cjs-es";

export default {
	input: "index.js",
	output: {
		format: "iife",
		name: "GM_context"
	},
	plugins: [commonjs()]
};

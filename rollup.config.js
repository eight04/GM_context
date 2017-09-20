import commonjs from "rollup-plugin-commonjs";

export default {
	input: "index.js",
	output: {
		format: "iife",
		name: "GM_context"
	},
	plugins: [commonjs()]
};

import { AbstractParser, EnclosingContext } from "../../constants";
import * as parser from "@babel/parser";
const filbert = require("filbert");

// Modify to match filbert's node structure
interface FilbertNode {
	type: string;
	start: number;
	end: number;
	loc: {
		start: { line: number; column: number };
		end: { line: number; column: number };
	};
	body?: FilbertNode[];
}

const processNode = (
	node: FilbertNode,
	lineStart: number,
	lineEnd: number,
	largestSize: number,
	largestEnclosingContext: FilbertNode | null
) => {
	const { start, end } = node.loc;
	console.log("python process node");
	console.log(start, end, lineStart, lineEnd);

	if (start.line <= lineStart && lineEnd <= end.line) {
		const size = end.line - start.line;
		if (size > largestSize) {
			largestSize = size;
			largestEnclosingContext = node;
		}
	}
	return { largestSize, largestEnclosingContext };
};

export class PythonParser implements AbstractParser {
	findEnclosingContext(
		file: string,
		lineStart: number,
		lineEnd: number
	): EnclosingContext {
		const ast = filbert.parse(file, {
			locations: false,
			ranges: false,
		}) as FilbertNode;
		let largestEnclosingContext: FilbertNode = null;
		let largestSize = 0;
		console.log("python find enclosing context");

		// Recursive function to walk the AST
		const visitNode = (node: FilbertNode) => {
			console.log("node type", node.type);
			if (node.type === "FunctionDef" || node.type === "ClassDef") {
				({ largestSize, largestEnclosingContext } = processNode(
					node,
					lineStart,
					lineEnd,
					largestSize,
					largestEnclosingContext
				));
			}

			// Visit children if they exist
			if (node.body) {
				console.log("visiting children");
				node.body.forEach(visitNode);
			}
		};

		// Start traversal from root
		visitNode(ast);

		return {
			enclosingContext: largestEnclosingContext,
		} as EnclosingContext;
	}
	dryRun(file: string): { valid: boolean; error: string } {
		try {
			const ast = filbert.parse(file, { locations: false, ranges: false });
			console.log(JSON.stringify(ast, null, 2));
			return {
				valid: true,
				error: "cannot parse ast dry run",
			};
		} catch (exc) {
			return {
				valid: false,
				error: exc,
			};
		}
	}
}

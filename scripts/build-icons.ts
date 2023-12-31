import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import { parse } from 'node-html-parser'

// returns current working directory of the process
const cwd = process.cwd()
// returns the absolute path of the input directory
const inputDir = path.join(cwd, 'other', 'icons')
// returns the absolute path of the output directory
const outputDir = path.join(cwd, 'app', 'components')
const typesDir = path.join(cwd, 'app', 'types')

// returns an array of all svg files in the input directory
const files = glob.sync('**/*.svg', {
	cwd: inputDir,
})
if (files.length === 0) {
	console.log(`No SVG files found in svg-icons`)
	process.exit()
}
// The relative paths are just for cleaner logs
console.log(`Generating sprite for svg-icons`)

// returns an SVG string with all the icons as symbols
const spritesheetContent = await generateSvgSprite({
	files,
	inputDir,
})

// writes the SVG string to the output directory
await writeIfChanged(path.join(outputDir, 'sprite.svg'), spritesheetContent)
/**
 * Outputs an SVG string with all the icons as symbols
 */
async function generateSvgSprite({
	files,
	inputDir,
}: {
	files: string[]
	inputDir: string
}) {
	// Each SVG becomes a symbol and we wrap them all in a single SVG
	const symbols = await Promise.all(
		files.map(async file => {
			const input = await fs.promises.readFile(
				path.join(inputDir, file),
				'utf8',
			)
			// returns a root DOM node of the parsed HTML
			const root = parse(input)
			const svg = root.querySelector('svg')
			if (!svg) throw new Error('No SVG element found')
			svg.tagName = 'symbol'
			svg.setAttribute('id', file.replace('.svg', ''))
			svg.removeAttribute('xmlns')
			svg.removeAttribute('xmlns:xlink')
			svg.removeAttribute('version')
			svg.removeAttribute('width')
			svg.removeAttribute('height')
			return svg.toString().trim()
		}),
	)
	return [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0">`,
		...symbols,
		`</svg>`,
	].join('\n')
}
/**
 * Each write can trigger dev server reloads
 * so only write if the content has changed
 */
async function writeIfChanged(filepath: string, newContent: string) {
	const currentContent = await fs.promises.readFile(filepath, 'utf8')
	if (currentContent !== newContent) {
		return fs.promises.writeFile(filepath, newContent, 'utf8')
	}
}
const typesContent = await generateTypes({
	names: files.map(file => JSON.stringify(file.replace('.svg', ''))),
})
await writeIfChanged(path.join(typesDir, 'sprite-names.ts'), typesContent)
async function generateTypes({ names }: { names: string[] }) {
	return [
		`// This file is generated by npm run build:icons`,
		'',
		`export type IconName =`,
		...names.map(name => `\t| ${name}`),
		'',
	].join('\n')
}

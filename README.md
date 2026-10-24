# Rank List Studio

An editable exam rank-list poster inspired by the SYZYGY chemistry design. The site is a standalone static HTML page and needs no server or package installation.

## Features

- 20 student rows to start, with support for up to 50 students.
- Edit names, schools, marks, exam details and teacher branding.
- Paste spreadsheet results or import CSV / TSV, then sort by marks.
- Bebas result text, Evagrande headline and Montserrat headings.
- Choose separate top and bottom colours for the left-bar fade.
- Live poster preview, 2000 × 2000 PNG export and Print / PDF.
- Automatic browser-local saving and JSON project backups.

## Use

Open `index.html` in a modern browser, or visit the GitHub Pages site. Select **Students** to enter results and **Style** to adjust branding and the two-colour fade. Complete names and marks before exporting.

The supplied example has ten filled student rows and ten blank rows ready to enter. Your edits stay in that browser's local storage; they are not uploaded to GitHub. **Save data** downloads a portable JSON backup, and **Load data** restores it. Browser-local data does not automatically move between a local file and the hosted site.

## Edit and build

The editable source lives in `src/`. With Node.js installed, run:

```sh
node build.cjs
```

This regenerates the root `index.html` with all fonts, the original teacher artwork and the black logo embedded. The build uses repository-relative files and has no external dependencies.

## GitHub Pages

Use **Settings → Pages → Deploy from a branch**, select **main** and **/ (root)**, then save. The root `.nojekyll` file tells Pages to serve these static files directly. Commit the rebuilt `index.html` whenever source changes should appear on the site.

## Assets and font notices

Font, logo and reference artwork rights remain with their respective owners. The existing notices are retained in the generated page and source. Montserrat is under the SIL Open Font License 1.1, included in the template comment. The supplied Evagrande font metadata identifies it as personal use only; obtain appropriate rights for any commercial use. No blanket licence is applied to third-party assets.

![Poster preview](preview.png)

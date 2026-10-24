(function (global) {
  'use strict';

  const LIMIT = 200;
  const HEADER_NAMES = {
    rank: 'rank', position: 'rank', '#': 'rank',
    name: 'name', 'student name': 'name', 'full name': 'name', student: 'name',
    school: 'school', 'school name': 'school', institution: 'school',
    marks: 'marks', mark: 'marks', score: 'marks', 'total marks': 'marks'
  };

  function clean(value) {
    return value.replace(/^\uFEFF/, '').trim();
  }

  // Tabs take precedence because Excel cells can contain unquoted commas.
  function delimiterFor(text) {
    let quoted = false;
    let tabs = 0;
    let commas = 0;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (char === '"') {
        if (quoted && text[i + 1] === '"') i += 1;
        else quoted = !quoted;
      } else if (!quoted) {
        if (char === '\t') tabs += 1;
        else if (char === ',') commas += 1;
        else if (char === '\n' || char === '\r') {
          if (tabs || commas) break;
        }
      }
    }
    return tabs ? '\t' : ',';
  }

  function readRows(text, delimiter) {
    const rows = [];
    let cells = [];
    let field = '';
    let state = 'start';
    let error = '';
    let line = 1;
    let rowLine = 1;

    function finishField() {
      cells.push(clean(field));
      field = '';
      state = 'start';
    }

    function finishRow() {
      finishField();
      if (cells.some(value => value !== '') || error) {
        rows.push({ cells, line: rowLine, error });
      }
      cells = [];
      error = '';
    }

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const newline = char === '\r' || char === '\n';
      if (state === 'quoted') {
        if (char === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 1;
          } else state = 'closed';
        } else if (newline) {
          field += '\n';
          if (char === '\r' && text[i + 1] === '\n') i += 1;
          line += 1;
        } else field += char;
      } else if (char === delimiter) {
        finishField();
      } else if (newline) {
        finishRow();
        if (char === '\r' && text[i + 1] === '\n') i += 1;
        line += 1;
        rowLine = line;
      } else if (state === 'start' && char === '"') {
        field = '';
        state = 'quoted';
      } else if (state === 'closed') {
        if (!/\s/.test(char)) {
          error = 'unexpected text after a closing quote';
          field += char;
          state = 'unquoted';
        }
      } else {
        field += char;
        if (!/\s/.test(char)) state = 'unquoted';
      }
    }
    if (state === 'quoted') error = 'a quoted cell is missing its closing quote';
    finishRow();
    return rows;
  }

  function headerFor(cells) {
    const columns = {};
    let duplicate = false;
    let unknown = false;
    cells.forEach((value, index) => {
      const label = value.toLowerCase().replace(/\s+/g, ' ');
      const key = Object.prototype.hasOwnProperty.call(HEADER_NAMES, label) ? HEADER_NAMES[label] : null;
      if (value && !key) unknown = true;
      if (key) {
        if (Object.prototype.hasOwnProperty.call(columns, key)) duplicate = true;
        columns[key] = index;
      }
    });
    // Both labels are required so a student called "Name" is still data.
    return !duplicate && !unknown && columns.name !== undefined && columns.marks !== undefined
      ? columns : null;
  }

  function parse(text) {
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('Paste a rank list or choose a CSV/TSV file first.');
    }
    text = text.replace(/^\uFEFF/, '');
    const rows = readRows(text, delimiterFor(text));
    const warnings = [];
    const students = [];
    let columns = null;
    if (rows.length && !rows[0].error) {
      columns = headerFor(rows[0].cells);
      if (columns) rows.shift();
    }

    let overflow = 0;
    for (const row of rows) {
      const fail = message => warnings.push('Line ' + row.line + ': ' + message + '; row skipped.');
      if (row.error) {
        fail(row.error);
        continue;
      }
      let indexes = columns;
      if (!indexes) {
        if (row.cells.length === 3) indexes = { name: 0, school: 1, marks: 2 };
        else if (row.cells.length === 4 && /^\d+$/.test(row.cells[0])) {
          indexes = { name: 1, school: 2, marks: 3 };
        } else {
          fail('expected Name, School, Marks (optionally preceded by a numeric Rank)');
          continue;
        }
      }
      const name = row.cells[indexes.name] || '';
      const school = indexes.school === undefined ? '' : row.cells[indexes.school] || '';
      const rawMarks = row.cells[indexes.marks] || '';
      if (!name) {
        fail('student name is empty');
        continue;
      }
      if (!rawMarks) {
        fail('marks are empty');
        continue;
      }
      const marks = Number(rawMarks);
      if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
        fail('marks must be a number from 0 to 100');
        continue;
      }
      if (students.length < LIMIT) students.push({ name, school, marks: marks.toFixed(2) });
      else overflow += 1;
    }
    if (overflow) warnings.push('Only the first ' + LIMIT + ' valid students were imported; ' + overflow + ' additional rows were omitted.');
    if (!students.length) {
      const detail = warnings.length ? ' ' + warnings[0] : '';
      throw new Error('No valid students found. Use Name, School, Marks columns, with marks from 0 to 100.' + detail);
    }
    return { students, warnings };
  }

  global.RankImport = { parse };
}(typeof window !== 'undefined' ? window : globalThis));


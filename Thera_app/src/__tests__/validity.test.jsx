/*
#######################################################################
#
# Copyright (C) 2020-2024 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
/*
#######################################################################
#######               DO NOT MODIFY THIS FILE               ###########
#######################################################################
*/

import {test, expect} from 'vitest';
import {render} from '@testing-library/react';
import App from '../App';

import fs from 'fs';
import {readdir} from 'node:fs/promises';

/*
 * Should be using at least 10 Material UI Components
 */
test('Using Material UI', async () => {
  render(<App />);
  const elements = document.querySelectorAll('[class^=Mui]');
  expect(elements.length > 10).toBe(true);
});

/*
 * Should NOT be using Props in lieu of state/context.
 *
 * Two are allowed for the email list and mailbox list entriea.
 *
 * If using a version of node earlier than v20 this test will pass
 * even if you are using Props, so make aure you have an up-to-date
 * version of node or you may get a nasty shock from the autograder.
 */
test('Not Too Many Components Using Props', async () => {
  const files = await readdir('src', {recursive: true});
  let cnt = 0;
  for (const file of files) {
    if ((!file.startsWith(`__tests__`)) && file.endsWith(`.jsx`)) {
      const data = fs.readFileSync(`src/${file}`, {encoding: 'utf8'});
      if (data.includes('PropTypes') ||
        data.includes('propTypes') ||
        data.includes('prop-types')) {
        cnt++;
      }
    }
  }
  expect(cnt <= 2).toBe(true);
});

/*
 * Should be using Context to share state between Components.
 */
test('Using Context', async () => {
  const files = await readdir('src', {recursive: true});
  let cnt = 0;
  for (const file of files) {
    if ((!file.startsWith(`__tests__`)) &&
        ((file.endsWith(`.jsx`) || file.endsWith(`.js`)))) {
      const data = fs.readFileSync(`src/${file}`, {encoding: 'utf8'});
      if (data.includes('createContext')) {
        cnt++;
      }
    }
  }
  expect(cnt >= 1).toBe(true);
});

/*
 * Should be using State.
 */
test('Using State', async () => {
  const files = await readdir('src', {recursive: true});
  let cnt = 0;
  for (const file of files) {
    if ((!file.startsWith(`__tests__`)) &&
        ((file.endsWith(`.jsx`) || file.endsWith(`.js`)))) {
      const data = fs.readFileSync(`src/${file}`, {encoding: 'utf8'});
      if (data.includes('useState')) {
        cnt++;
      }
    }
  }
  expect(cnt >= 1).toBe(true);
});

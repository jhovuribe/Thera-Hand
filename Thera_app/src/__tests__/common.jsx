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

import {expect} from 'vitest';
import {screen} from '@testing-library/react';

/**
 * @param {string} pattern
 * @return {element} clickable
 */
export function getClickable(pattern) {
  return screen.getByRole('button', {
    name: pattern,
  });
}
/**
 * @param {string} pattern
 * @param {number} count if udefined, find at least one
 * @return {element} if COUNT is 1 or undefined, undefined otherwise
 */
export function getManyVisible(pattern, count) {
  const elements = screen.queryAllByText(pattern);
  let visible = elements.length;
  let one = undefined;
  elements.map((element) => {
    try {
      expect(element).toBeVisible();
      one = one ? one : element;
    } catch {
      visible--;
    }
    return null;
  });
  if (count !== undefined) {
    expect(visible).toBe(count);
  } else {
    expect(visible >= 1).toBe(true);
  }
  return count === 1 || count === undefined ? one : undefined;
}
/**
 * @param {string} pattern
 */
export function getNotVisible(pattern) {
  getManyVisible(pattern, 0);
}
/**
 * @param {string} pattern
 * @return {object} visible element
 */
export function getOnlyVisible(pattern) {
  return getManyVisible(pattern, 1);
}
/**
 * @param {string} pattern
 * @return {object} first visible element
 */
export function getAnyVisible(pattern) {
  return getManyVisible(pattern, undefined);
}

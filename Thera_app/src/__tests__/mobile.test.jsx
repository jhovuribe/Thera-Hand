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

import {test, beforeAll} from 'vitest';
import {render, fireEvent} from '@testing-library/react';
import {getOnlyVisible, getClickable, getNotVisible} from './common';
import App from '../App';

beforeAll(() => {
  window.resizeTo = function resizeTo(width, height) {
    Object.assign(this, {
      innerWidth: width,
      innerHeight: height,
      outerWidth: width,
      outerHeight: height,
    }).dispatchEvent(new this.Event('resize'));
  };
});

/**
 * Button to toggle visibility of the mailbox selection drawer
 * should be visible and clickable. Requires a single element to
 * have an aria-label attribute of "toggle drawer"
 */
test('Toggle Drawer Clickable', async () => {
  window.resizeTo(550, 1024);
  render(<App />);
  getClickable('toggle drawer');
});

/**
 * Initially the drawer is not shown, hence the Inbox and Trash
 * buttons are invisible. After clicking the toggle button, both
 * become visible. Requires a single element to have an
 * aria-label attribute of "toggle drawer".
 */
test('Open then close Drawer', async () => {
  window.resizeTo(550, 1024);
  render(<App />);
  getNotVisible('Inbox');
  getNotVisible('Trash');
  fireEvent.click(getClickable('toggle drawer'));
  getOnlyVisible('Inbox');
  getOnlyVisible('Trash');
});

/**
 * Initially the mail reader is not shown. After clicking an email
 * the reader becomes visible. After closing the reader, it becomes
 * invisible. Requires a single element to have an aria-label
 * attribute of "close mobile reader".
 */
test('Open and Close Mail Reader', async () => {
  window.resizeTo(550, 1024);
  render(<App />);
  getNotVisible('close mobile reader');
  getNotVisible('Subject: Fancy a brew tonight?');
  fireEvent.click(getOnlyVisible('Bob Dylan'));
  getOnlyVisible('Subject: Fancy a brew tonight?');
  getOnlyVisible('To: App User (user@app.com)');
  getOnlyVisible('From: Bob Dylan (bob@bob.com)');
  fireEvent.click(getClickable('close mobile reader'));
  getNotVisible('Subject: Fancy a brew tonight?');
});

/**
 * Open the drawer to select Trash then again to select Inbox.
 * Requires a single element to have an aria-label attribute of
 * "toggle drawer".
 */
test('Select Trash then Inbox', async () => {
  window.resizeTo(550, 1024);
  render(<App />);
  fireEvent.click(getClickable('toggle drawer'));
  fireEvent.click(getOnlyVisible('Trash'));
  getOnlyVisible('CSE186 Mail - Trash');
  fireEvent.click(getClickable('toggle drawer'));
  fireEvent.click(getOnlyVisible('Inbox'));
  getOnlyVisible('CSE186 Mail - Inbox');
});

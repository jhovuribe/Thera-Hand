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

import emails from './emails.json';

/**
 * @param {object} date to be trimmed
 * @return {string} ISO date with the seconds trimmed off
 */
function trimSeconds(date) {
  return new Date(date).toISOString().split('.')[0] +'Z';
}

/**
 * @return {date} half past eleven today
 */
function halfPastNineToday() {
  const date = new Date();
  date.setHours(9);
  date.setMinutes(30);
  return date;
}

/**
 * @return {string} one month and two days ago
 */
function lastMonth() {
  const date = new Date();
  date.setMonth(date.getMonth()-1);
  date.setDate(date.getDate()-2);
  return new Date(date);
}

/**
 * @return {string} one week ago
 */
function lastWeek() {
  const date = new Date();
  date.setDate(date.getDate()-7);
  return new Date(date);
}

/**
 * Load test data, take care to call only once
 */
function loader() {
  let id = emails.length+1;

  emails.push({
    id: id++,
    to: {name: 'App User', address: 'user@app.com'},
    from: {name: 'Bob Dylan', address: 'bob@bob.com'},
    subject: 'Fancy a brew tonight?',
    received: trimSeconds(halfPastNineToday()),
    mailbox: 'inbox',
  });

  emails.push({
    id: id++,
    to: {name: 'App User', address: 'user@app.com'},
    from: {name: 'Lt. Dish', address: 'ltdish@mash4077.dod.gov'},
    subject: 'Meet me in the supply room',
    received: trimSeconds(lastWeek()),
    mailbox: 'inbox',
  });

  emails.push({
    id: id++,
    to: {name: 'App User', address: 'user@app.com'},
    from: {name: 'Big Bird', address: 'bigbird@pbs.org'},
    subject: 'Have you seen my car keys??',
    received: trimSeconds(lastMonth()),
    mailbox: 'trash',
  });
}

export default loader;

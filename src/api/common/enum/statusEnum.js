/*
 * Copyright (c) Akveo 2020. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const StatusEnum = {
  new: 'New',
  inProgress: 'In Progress',
  done: 'Done',
};

function getStatusPriority(status) {
  let priority;
  switch (status) {
    case StatusEnum.new: priority = 1; break;
    case StatusEnum.inProgress: priority = 2; break;
    case StatusEnum.done: priority = 3; break;
    default: throw new Error(`Unknown status ${status}`);
  }
  return priority;
}

module.exports = { StatusEnum, getStatusPriority };

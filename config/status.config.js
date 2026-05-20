export const ISSUE_STATUS = {
  REPORTED:'reported' ,
  VERIFIED: 'verified',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  AWAITING_CONFIRMATION: 'awaiting_confirmation',
  CLOSED: 'closed',
  REJECTED: 'rejected',
  REOPENED: 'reopened',
};

export const STATUS_TRANSITIONS = {
  reported: ["verified","closed"],

  verified: ["assigned","closed"],

  assigned: ["in_progress","closed"],

  in_progress: ["resolved","closed"],

  resolved: ["awaiting_confirmation","closed"],

  awaiting_confirmation: ["closed","rejected"],

  closed: ["reopened"],

  rejected: ["verified","closed"],

  reopened: ["verified","closed"],
};

export const STATUS_PERMISSIONS = {
  student: ["reported","reopened","closed","rejected"],
  
  warden: ["verified", "assigned", "closed"],

  worker: ["in_progress","resolved","awaiting_confirmation"],

  superadmin: ["*"],
};
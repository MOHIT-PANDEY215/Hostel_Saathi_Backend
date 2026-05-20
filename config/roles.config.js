export const ROLES = {
  STUDENT: "student",
  WARDEN: "warden",
  WORKER: "worker",
  SUPER_ADMIN: "superadmin",
};

export const PERMISSIONS = {
  REPORT_ISSUE: "report_issue",
  VIEW_OWN_ISSUE: "view_own_issue",
  VIEW_ALL_ISSUES: "view_all_issues",
  VERIFY_ISSUE: "verify_issue",
  ASSIGN_ISSUE: "assign_issue",
  UPDATE_ISSUE_STATUS: "update_issue_status",
  CLOSE_ISSUE: "close_issue",
  REOPEN_ISSUE: "reopen_issue",
  REJECT_ISSUE: "reject_issue",

  ADD_STUDENT: "add_student",
  REMOVE_STUDENT: "remove_student",
  MANAGE_STUDENTS: "manage_students",

  ADD_WARDEN: "add_warden",
  REMOVE_WARDEN: "remove_warden",
  MANAGE_WARDENS: "manage_wardens",

  ADD_WORKER: "add_worker",
  REMOVE_WORKER: "remove_worker",
  MANAGE_WORKERS: "manage_workers",

  CREATE_ORG: "create_org",
  MANAGE_ORG: "manage_org",

  CREATE_HOSTEL: "create_hostel",
  MANAGE_HOSTELS: "manage_hostels",

  CREATE_ROOM: "create_room",
  UPDATE_ROOM: "update_room",
  DELETE_ROOM: "delete_room",
  VIEW_ROOMS: "view_rooms",

  CREATE_BED: "create_bed",
  UPDATE_BED: "update_bed",
  DELETE_BED: "delete_bed",
  ASSIGN_BED: "assign_bed",
  UNASSIGN_BED: "unassign_bed",
  VIEW_BEDS: "view_beds",

  MANAGE_TAGS: "manage_tags",
};

export const ROLE_PERMISSIONS = {
  [ROLES.STUDENT]: [
    PERMISSIONS.REPORT_ISSUE,
    PERMISSIONS.VIEW_OWN_ISSUE,
    PERMISSIONS.REOPEN_ISSUE,
    PERMISSIONS.REJECT_ISSUE,
  ],

  [ROLES.WARDEN]: [
    PERMISSIONS.VIEW_ALL_ISSUES,
    PERMISSIONS.VERIFY_ISSUE,
    PERMISSIONS.ASSIGN_ISSUE,
    PERMISSIONS.CLOSE_ISSUE,

    PERMISSIONS.ADD_STUDENT,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.REMOVE_STUDENT,

    PERMISSIONS.ADD_WORKER,
    PERMISSIONS.MANAGE_WORKERS,
    PERMISSIONS.REMOVE_WORKER,

    PERMISSIONS.CREATE_ROOM,
    PERMISSIONS.UPDATE_ROOM,
    PERMISSIONS.VIEW_ROOMS,

    PERMISSIONS.CREATE_BED,
    PERMISSIONS.ASSIGN_BED,
    PERMISSIONS.UNASSIGN_BED,
    PERMISSIONS.VIEW_BEDS,

    PERMISSIONS.MANAGE_TAGS,
  ],

  [ROLES.WORKER]: [
    PERMISSIONS.UPDATE_ISSUE_STATUS,
    PERMISSIONS.VIEW_ALL_ISSUES,
  ],

  [ROLES.SUPER_ADMIN]: ["*"], // full access
};

export const ROLE_SCOPES = {
  [ROLES.STUDENT]: "hostel",
  [ROLES.WARDEN]: "hostel",
  [ROLES.WORKER]: "hostel",
  [ROLES.SUPER_ADMIN]: "organisation",
};
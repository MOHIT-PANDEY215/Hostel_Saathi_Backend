import { ROLE_PERMISSIONS, ROLE_SCOPES, ROLES } from "../config/roles.config.js";

export const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    const { role } = req.user;

    const permissions = ROLE_PERMISSIONS[role] || [];

    const hasPermission = permissions.includes("*") ||
      requiredPermissions?.some((perm) => permissions.includes(perm));

    if (
      !hasPermission
    ) {
      throw new ApiError(403, "Forbidden");
    }

    next();
  };
};

export const authorizeOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    const resourceUserId = await getResourceUserId(req);

    if (!resourceUserId) {
      throw new ApiError(404, "Resource not found");
    }

    if (resourceUserId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Forbidden: not your resource");
    }

    next();
  };
};

export const authorizeScope = (getResourceScope) => {
  return async (req, res, next) => {
    const resource = await getResourceScope(req);

    if (!resource) {
      throw new ApiError(404, "Resource not found");
    }

    const { role, orgId, hostelId } = req.user;
    const scope = ROLE_SCOPES[role];

    if (scope === "organisation") {
      if (orgId?.toString() !== resource.orgId?.toString()) {
        throw new ApiError(403, "Cross-org access denied");
      }
      return next();
    }

    // 🏠 HOSTEL LEVEL
    if (scope === "hostel") {
      if (hostelId?.toString() !== resource.hostelId?.toString()) {
        throw new ApiError(403, "Cross-hostel access denied");
      }
      return next();
    }

    next();
  };
};

export const authorizeStatusUpdate = (getCurrentStatus) => {
  return async (req, res, next) => {
    const { role } = req.user;
    const { nextStatus } = req.body;

    const currentStatus = await getCurrentStatus(req);

    if (!currentStatus) {
      throw new ApiError(404, "Issue not found");
    }

    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(nextStatus)) {
      throw new ApiError(
        400,
        `Invalid status transition: ${currentStatus} → ${nextStatus}`
      );
    }

    const rolePermissions = STATUS_PERMISSIONS[role] || [];

    if (
      !rolePermissions.includes("*") &&
      !rolePermissions.includes(nextStatus)
    ) {
      throw new ApiError(
        403,
        "Forbidden: cannot set this status"
      );
    }

    next();
  };
};
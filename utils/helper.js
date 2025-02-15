export const getSortBy = (sort) => {
    let sortBy;
    switch (sort) {
      case "dateAssigned":
        sortBy = { dateAssigned: -1 };
        break;
      case "dateCompleted":
        sortBy = { dateCompleted: -1 };
        break;
      default:
        sortBy = { createdAt: -1 };
        break;
    }
    return sortBy;
  };
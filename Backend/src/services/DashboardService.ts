import { IDataAccess } from "../dataaccess/IDataAccess";
import { MockDataAccess } from "../dataaccess/MockDataAccess";
const dataAccess: IDataAccess = new MockDataAccess();
export const getDashboardSummary = async () => {
  const summary = await dataAccess.getDashboardSummary();
  return summary;
};

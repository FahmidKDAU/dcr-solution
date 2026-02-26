import { PnPSetup } from "./PnPSetup";
import "@pnp/sp/attachments";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import { LookupFieldItem } from "../types/LookupFieldItem";
import { AudienceGroup } from "../types/AudienceGroup";

const getDocumentTypes = async (): Promise<LookupFieldItem[]> => {
  try {
    const sp = PnPSetup.getSP();
    const documentTypes = await sp.web.lists
      .getByTitle("Document Types Configuration")
      .items.select("Id", "Title")
      .orderBy("Title", true)();

    return documentTypes as LookupFieldItem[];
  } catch (error) {
    console.error("Error fetching document types:", error);
    return [];
  }
};

const getCategories = async (): Promise<LookupFieldItem[]> => {
  try {
    const sp = PnPSetup.getSP();
    const categories = await sp.web.lists
      .getByTitle("Categories Configuration")
      .items.select("Id", "Title")
      .orderBy("Title", true)();
    return categories as LookupFieldItem[];
  } catch (error) {
    console.error("Error fetching document categories:", error);
    return [];
  }
};

const getAudienceGroups = async (): Promise<AudienceGroup[]> => {
  try {
    const sp = PnPSetup.getSP();
    const groups = await sp.web.lists
      .getByTitle("Audience Groups Configuration")
      .items.select("Id", "Title")  // just these two for now
      .orderBy("Title", true)();

    console.log("groups", JSON.stringify(groups));
    return groups as AudienceGroup[];
  } catch (error) {
    console.error("Error fetching audience groups:", error);
    return [];
  }
};
const getBusinessFunctions = async (): Promise<LookupFieldItem[]> => {
  try {
    const sp = PnPSetup.getSP();
    const businessFunctions = await sp.web.lists
      .getByTitle("Business Functions Configuration")
      .items.select("Id", "Title")
      .orderBy("Title", true)();
    return businessFunctions as LookupFieldItem[];
  } catch (error) {
    console.error("Error fetching business functions:", error);
    return [];
  }
};

export default {
  getDocumentTypes,
  getCategories,
  getAudienceGroups,
  getBusinessFunctions,
};

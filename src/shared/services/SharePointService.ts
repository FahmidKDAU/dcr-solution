import { PnPSetup } from "./PnPSetup";
import { SharePointPerson } from "../types/SharePointPerson";
import { Document } from "../types/Document";
import { Department } from "../types/Department";
import { IChangeRequest } from "../types/ChangeRequest";
import "@pnp/sp/attachments";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import { Task } from "../types/Task";

const getDepartments = async (): Promise<Department[]> => {
  try {
    const sp = PnPSetup.getSP();
    const departments = await sp.web.lists
      .getByTitle("Departments Configuration")
      .items.select(
        "Id",
        "Title",
        "ChangeAuthority/Id", // ← Select person fields
        "ChangeAuthority/Title",
        "ChangeAuthority/EMail",
      )
      .expand("ChangeAuthority") // ← CRITICAL: Must expand!
      .orderBy("Title", true)();

    return departments as Department[];
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

const getChangeRequests = async (): Promise<IChangeRequest[]> => {
  try {
    const sp = PnPSetup.getSP();
    const changeRequests = await sp.web.lists
      .getByTitle("Change Requests")
      .items();
    return changeRequests;
  } catch (error) {
    console.error("Error fetching change requests:", error);
    throw error;
  }
};

const getChangeRequestById = async (
  id: number,
): Promise<IChangeRequest | null> => {
  try {
    const sp = PnPSetup.getSP();
    const changeRequest = await sp.web.lists
      .getByTitle("Change Requests")
      .items.getById(id).select(
        "Id",
        "Title",
        "ChangeRequestNumber",
        "ScopeofChange",
        "Status",
        "Urgency",
        "NewDocument",
        "Classification",
        "DraftDocumentName",
        "PublishedDate",
        // Lookup fields
        "CoreFunctionality/Id",
        "CoreFunctionality/Title",
        "BusinessFunction/Id",
        "BusinessFunction/Title",
        "Audience/Id",
        "Audience/Title",
        // People fields
        "ChangeAuthority/Id",
        "ChangeAuthority/Title",
        "ChangeAuthority/EMail",
        "ReleaseAuthority/Id",
        "ReleaseAuthority/Title",
        "ReleaseAuthority/EMail",
        "Author0/Id",
        "Author0/Title",
        "Author0/EMail",
        "Reviewers/Id",
        "Reviewers/Title",
        "Reviewers/EMail",
        "Contributors/Id",
        "Contributors/Title",
        "Contributors/EMail",
      )
      .expand(
        "CoreFunctionality",
        "BusinessFunction",
        "Audience",
        "ChangeAuthority",
        "ReleaseAuthority",
        "Author0",
        "Reviewers",
        "Contributors",
      )();

    return changeRequest as IChangeRequest;
  } catch (error) {
    console.error(`Error fetching change request with ID ${id}:`, error);
    return null;
  }
}; 

const createChangeRequest = async (
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  try {
    const sp = PnPSetup.getSP();

    const result = await sp.web.lists
      .getByTitle("Change Requests")
      .items.add(data);

    return result.data as Record<string, unknown>;
  } catch (error) {
    console.error("Error creating Change Request:", error);
    throw error;
  }
};


const updateChangeRequest = async (id: number, data: Record<string, unknown>): Promise<void> => {
  try {
    const sp = PnPSetup.getSP();
    await sp.web.lists
      .getByTitle("Change Requests")
      .items.getById(id)
      .update(data);
  } catch (error) {
    console.error("Error updating change request:", error);
    throw error;
  }
}; 


const getDocuments = async (): Promise<Document[]> => {
  try {
    const sp = PnPSetup.getSP();
    const documents = await sp.web.lists
      .getByTitle("Published Documents") // ← Change to your documents list name
      .items.select("Id", "DocumentTitle")();

    console.log(documents);
    return documents as unknown as Document[];
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

const getDocumentById = async (id: number): Promise<Document | null> => {
  try {
    const sp = PnPSetup.getSP();
    const document = await sp.web.lists
      .getByTitle("Published Documents")
      .items.getById(id)
      .select(
        "Id",
        "DocumentTitle",
        "DocumentType",
        "Classification",
        "AudienceId",
        "CoreFunctionalityId",
        "ChangeAuthorityId",
        // Expand lookup fields
        "Category/Id",
        "Category/Title",
        "Audience/Id",
        "Audience/Title",
        "BusinessFunction/Id",
        "BusinessFunction/Title",
        "CoreFunctionality/Id",
        "CoreFunctionality/Title",
        // Expand person fields
        "ChangeAuthority/Id",
        "ChangeAuthority/Title",
        "ChangeAuthority/EMail",
        "ReleaseAuthority/Id",
        "ReleaseAuthority/Title",
        "ReleaseAuthority/EMail",
        "Author0/Id",
        "Author0/Title",
        "Author0/EMail",
        "FileRef",
        "FileLeafRef",
      )
      .expand(
        "Category",
        "Audience",
        "BusinessFunction",
        "CoreFunctionality",
        "ChangeAuthority",
        "ReleaseAuthority",
        "Author0",
      )();
    console.log(document);
    return document as Document;
  } catch (error) {
    console.error(`Error fetching document with ID ${id}:`, error);
    throw error;
  }
};

const getTasks = async (userId: number): Promise<Task[]> => {
  try {
    const sp = PnPSetup.getSP();
    const tasks = await sp.web.lists
      .getByTitle("Tasks")
      .items.select(
        "Id",
        "Title",
        "Status",
        "TaskType",
        "DueDate",
        "Created",
        "ChangeRequestId",
        "ChangeRequest/Id",
        "ChangeRequest/Title",
        "AssignedTo/Id",
        "AssignedTo/Title",
        "AssignedTo/EMail",
        "Author/Id",
        "Author/EMail",
        "Requestor/Id",
        "Requestor/Title",
        "Requestor/EMail",
      )
      .expand("AssignedTo", "Author", "Requestor", "ChangeRequest")
      .filter(`AssignedTo/Id eq ${userId}`)();

    return tasks as Task[];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

const getTaskById = async (id: number): Promise<Task | null> => {
  try {
    const sp = PnPSetup.getSP();
    const task = await sp.web.lists
      .getByTitle("Tasks")
      .items.select(
        "Id",
        "Title",
        "Status",
        "TaskType",
        "DueDate",
        "Created",
        "ChangeRequestId",
        "ChangeRequest/Id",
        "ChangeRequest/Title",
        "AssignedTo/Id",
        "AssignedTo/Title",
        "AssignedTo/EMail",
        "Author/Id",
        "Author/EMail",
        "Requestor/Id",
        "Requestor/Title",
        "Requestor/EMail",
      )
      .expand("AssignedTo", "Author", "Requestor")
      .filter(`Id eq ${id}`)();
    return task.length > 0 ? (task[0] as Task) : null;
  } catch (error) {
    console.error(`Error fetching task with ID ${id}:`, error);
    throw error;
  }
};

const updateTask = async (taskId: number, data: Record<string, unknown>): Promise<void> => {
  try {
    const sp = PnPSetup.getSP();
    await sp.web.lists
      .getByTitle("Tasks")
      .items.getById(taskId)
      .update(data);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

const uploadAttachments = async (
  itemId: number,
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void,
): Promise<void> => {
  const sp = PnPSetup.getSP();
  if (!itemId || itemId <= 0) {
    throw new Error("Invalid list item id for attachment upload.");
  }

  if (!files || files.length === 0) {
    return;
  }

  const list = sp.web.lists.getByTitle("Change Requests");
  const listInfo = await list.select("EnableAttachments")();
  if (!listInfo.EnableAttachments) {
    await list.update({ EnableAttachments: true });
  }

  const item = list.items.getById(itemId);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (onProgress) {
      onProgress(i + 1, files.length, file.name);
    }

    const fileBuffer = await file.arrayBuffer();
    await item.attachmentFiles.add(file.name, fileBuffer);
  }
};

const getCurrentUser = async (): Promise<SharePointPerson> => {
  try {
    const sp = PnPSetup.getSP();
    const user = await sp.web.currentUser();
    console.log("Current user info:", user);
    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};
// Option 2: Search by Title OR Email
const searchUsers = async (searchText: string): Promise<SharePointPerson[]> => {
  try {
    const sp = PnPSetup.getSP();

    const users = await sp.web.siteUsers
      .filter(
        `(startswith(Title,'${searchText}')) or (startswith(EMail,'${searchText}'))`,
      )
      .select("Id", "Title", "EMail")
      .top(10)();

    console.log("Search results:", users);
    return users as SharePointPerson[];
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

export default {
  getDepartments,
  createChangeRequest,
  getDocuments,
  getDocumentById,
  uploadAttachments,
  getChangeRequests,
  getChangeRequestById,
  updateChangeRequest,
  getCurrentUser,
  searchUsers,
  getTasks,
  getTaskById,
  updateTask,
};

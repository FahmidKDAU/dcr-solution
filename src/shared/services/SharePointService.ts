import { PnPSetup } from "./PnPSetup";
import { SharePointPerson } from "../types/SharePointPerson";
import { Document } from "../types/Document";
import { Department } from "../types/Department";
import { IChangeRequest } from "../types/ChangeRequest";
import "@pnp/sp/attachments";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import { Task } from "../types/Task";
import { Participant } from "../types/Participant";

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
      .items.getById(id)
      .select(
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
        "DocumentType/Id", // ← add
        "DocumentType/Title", // ← add
        "Category/Id", // ← add
        "Category/Title", // ← add
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
        "Author/Id",
        "Author/Title",
        "Author/EMail",
        "Reviewers/Id",
        "Reviewers/Title",
        "Reviewers/EMail",
        "Contributors/Id",
        "Contributors/Title",
        "Contributors/EMail",
        // Document reference
        "TargetDocumentId",
      )
      .expand(
        "CoreFunctionality",
        "BusinessFunction",
        "DocumentType", // ← add
        "Category", // ← add
        "Audience",
        "ChangeAuthority",
        "ReleaseAuthority",
        "Author0",
        "Author", // ← add (needed for Submitted By)
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

const updateChangeRequest = async (
  id: number,
  data: Record<string, unknown>,
): Promise<void> => {
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
      .getByTitle("Published Documents")
      .items.select(
        "Id",
        "DocumentTitle",
        "PublishedDate",

        // Lookup fields
        "DocumentType/Id",
        "DocumentType/Title",
        "Category/Id",
        "Category/Title",
        "BusinessFunction/Id",
        "BusinessFunction/Title",
        "CoreFunctionality/Id",
        "CoreFunctionality/Title",
        "Audience/Id",
        "Audience/Title",
        // Choice field (no expand needed)
        "Classification",
      )
      .expand(
        "DocumentType",
        "Category",
        "BusinessFunction",
        "CoreFunctionality",
        "Audience",
      )
      .orderBy("DocumentTitle", true)();

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

        "Classification",

        // Expand lookup fields
        "DocumentType/Id",
        "DocumentType/Title",
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
        "DocumentType",
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
        "Comments",
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
        "Comments",
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

const updateTask = async (
  taskId: number,
  data: Partial<Task>,
): Promise<void> => {
  try {
    const sp = PnPSetup.getSP();
    await sp.web.lists.getByTitle("Tasks").items.getById(taskId).update(data);
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

const getAttachments = async (
  itemId: number,
): Promise<{ FileName: string; ServerRelativeUrl: string }[]> => {
  try {
    const sp = PnPSetup.getSP();
    const attachments = await sp.web.lists
      .getByTitle("Change Requests")
      .items.getById(itemId)
      .attachmentFiles();
    return attachments;
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return [];
  }
};

const getParticipants = async (
  changeRequestId: number,
): Promise<Participant[]> => {
  try {
    const sp = PnPSetup.getSP();
    const participants = await sp.web.lists
      .getByTitle("CR Participants")
      .items.select(
        "Id",
        "Title",
        "ChangeRequestId",
        "Role",
        "Status",
        "DueDate",
        "StartDate",
        "CompletedDate",
        "Notes",
        "Person/Id",
        "Person/Title",
        "Person/EMail",
      )
      .expand("Person")
      .filter(`ChangeRequestId eq ${changeRequestId}`)();

    return participants as Participant[];
  } catch (error) {
    console.error("Error fetching participants:", error);
    throw error;
  }
};

const createParticipant = async (
  changeRequestId: number,
  contributorIds: number[],
  reviewerIds: number[],
): Promise<void> => {
  const sp = PnPSetup.getSP();
  const list = sp.web.lists.getByTitle("CR Participants");

  const all = [
    ...contributorIds.map((id) => ({ PersonId: id, Role: "Contributor" })),
    ...reviewerIds.map((id) => ({ PersonId: id, Role: "Reviewer" })),
  ];

  await Promise.all(
    all.map((p) =>
      list.items.add({
        ChangeRequestId: changeRequestId,
        PersonId: p.PersonId,
        Role: p.Role,
        Status: "Not Started",
      }),
    ),
  );
};

const addParticipant = async (
  changeRequestId: number,
  personId: number,
  role: "Reviewer" | "Contributor",
): Promise<void> => {
  const sp = PnPSetup.getSP();
  await sp.web.lists.getByTitle("CR Participants").items.add({
    ChangeRequestId: changeRequestId,
    PersonId: personId,
    Role: role,
    Status: "Not Started",
  });
};

const updateParticipant = async (
  id: number,
  data: Partial<Participant>,
): Promise<void> => {
  try {
    const sp = PnPSetup.getSP();
    await sp.web.lists
      .getByTitle("CR Participants")
      .items.getById(id)
      .update(data);
  } catch (error) {
    console.error("Error updating participant:", error);
    throw error;
  }
};

const deleteParticipant = async (
  id: number,
  changeRequestId: number,
  personId: number,
): Promise<void> => {
  try {
    const sp = PnPSetup.getSP();

    // 1. Find their active task
    const tasks = await sp.web.lists
      .getByTitle("Tasks")
      .items.select("Id", "Status", "AssignedTo/Id")
      .expand("AssignedTo")
      .filter(`ChangeRequestId eq ${changeRequestId} and TaskType eq 'Participant Task'`)();

    const participantTask = tasks.find(
      (t) => t.AssignedTo?.Id === personId &&
      t.Status !== "Complete" &&
      t.Status !== "Cancelled"
    );

    // 2. Cancel it if found
    if (participantTask) {
      await sp.web.lists
        .getByTitle("Tasks")
        .items.getById(participantTask.Id)
        .update({ Status: "Cancelled" });
    }

    // 3. Delete the participant row
    await sp.web.lists
      .getByTitle("CR Participants")
      .items.getById(id)
      .delete();

  } catch (error) {
    console.error("Error deleting participant:", error);
    throw error;
  }
};

const getParticipantsByChangeRequestId = async (changeRequestId: number) => {
  const sp = PnPSetup.getSP();
  const rows = await sp.web.lists
    .getByTitle("CR Participants")
    .items
    .select("Id", "PersonId", "Role", "Status", "DueDate", "StartDate", "CompletedDate", "Notes")
    .filter(`ChangeRequestId eq ${changeRequestId}`)
    .top(50)();

  const enriched = await Promise.all(
    rows.map(async (row: any) => {
      const user = await sp.web.getUserById(row.PersonId).select("Id", "Title")();
      return {
        Id: row.Id,
        PersonId: row.PersonId,
        Role: row.Role,
        Status: row.Status ?? "Not Started",
        DueDate: row.DueDate,
        StartDate: row.StartDate,
        CompletedDate: row.CompletedDate,
        Notes: row.Notes,
        Person: { Id: row.PersonId, Title: user.Title, EMail: "" },
      };
    })
  );

  return enriched;
};

const getParticipantByTaskContext = async (
  changeRequestId: number,
  userId: number,
): Promise<{ Id: number; Notes?: string } | null> => {
  const sp = PnPSetup.getSP();

  const results = await sp.web.lists
    .getByTitle("CR Participants")
    .items.select("Id", "Notes", "Role")
    .filter(
      `ChangeRequestId eq ${changeRequestId} and PersonId eq ${userId}`,
    )
    .top(1)();

  return results[0] ?? null;
};

const getParticipantTaskByContext = async (
  changeRequestId: number,
  userId: number,
  role: "Contributor" | "Reviewer",
): Promise<{ Id: number; Comments?: string } | null> => {
  const sp = PnPSetup.getSP();
  const taskType = role === "Reviewer" ? "Reviewer Task" : "Contributor Task";

  // Filter by ChangeRequestId and AssignedTo separately to avoid compound OData
  // filter issues with expanded person fields, then match TaskType in JS.
  const tasks = await sp.web.lists
    .getByTitle("Tasks")
    .items.select("Id", "Comments", "TaskType", "AssignedTo/Id")
    .expand("AssignedTo")
    .filter(`ChangeRequestId eq ${changeRequestId} and AssignedTo/Id eq ${userId}`)
    .top(10)();

  const match = tasks.find((t: { TaskType: string }) => t.TaskType === taskType);
  if (match) {
    return match as { Id: number; Comments?: string };
  }
  // Fallback: return first result if no TaskType match (e.g. task type not yet set)
  console.warn(
    `[getParticipantTaskByContext] No task with TaskType "${taskType}" found for CR ${changeRequestId}, user ${userId}. Tasks found:`,
    tasks,
  );
  return (tasks[0] as { Id: number; Comments?: string }) ?? null;
};

const getDraftDocumentFolderByChangeRequestId = async (
  changeRequestId: number,
): Promise<string | null> => {
  try {
    const sp = PnPSetup.getSP();
    const results = await sp.web.lists
      .getByTitle("Draft Documents")
      .items.select(
        "Id",
        "Title",
        "FileRef",
        "FileLeafRef",
        "ChangeRequest/Id",
        "ChangeRequest/Title",
      )
      .expand("ChangeRequest")
      .filter(`ChangeRequest/Id eq ${changeRequestId}`)();

    return results[0]?.FileRef ?? null;
  } catch (error) {
    console.error("Error fetching draft document folder:", error);
    return null;
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
  getAttachments,
  getParticipants,
  createParticipant,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  getParticipantsByChangeRequestId,
  getParticipantByTaskContext,
  getParticipantTaskByContext,
  getDraftDocumentFolderByChangeRequestId,
};

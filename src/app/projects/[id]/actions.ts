"use server";

import { createDocument, uploadFileToDocument, getDocuments } from "@/lib/services/documentService";
import { updateProject, deleteProject, getProject, addProjectNote } from "@/lib/services/projectService";
import { createTask, updateTask, deleteTask, getTasks } from "@/lib/services/taskService";
import { createActivityLog } from "@/lib/services/activityLogService";
import { ProjectDocument, Project, Task, TaskStatus } from "@/types";
import { requireAuth, getCurrentUser } from "@/lib/auth/auth";

export async function uploadDocumentAction(
  projectId: string,
  documentId: string,
  formData: FormData
) {
  // 認証チェック
  await requireAuth();
  
  const file = formData.get("file") as File | null;

  if (!file) {
    return { error: "ファイルが選択されていません" };
  }

  try {
    await uploadFileToDocument(projectId, documentId, file);
    
    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user) {
        // 書類名を取得するために書類一覧を取得
        const documents = await getDocuments(projectId);
        const document = documents.find(doc => doc.id === documentId);
        
        await createActivityLog(projectId, {
          actionType: "document_file_uploaded",
          description: document 
            ? `書類「${document.name}」にファイル「${file.name}」をアップロードしました`
            : `書類（ID: ${documentId}）にファイル「${file.name}」をアップロードしました`,
          details: {
            documentId: documentId,
            documentName: document?.name,
            fileName: file.name,
          },
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error uploading document:", error);
    return { error: "ファイルのアップロードに失敗しました。もう一度お試しください。" };
  }
}

export async function createDocumentAction(
  projectId: string,
  formData: FormData
) {
  // 認証チェック
  await requireAuth();
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const category = formData.get("category") as ProjectDocument["category"] | null;
  const source = formData.get("source") as ProjectDocument["source"] | null;
  const assignedTo = formData.get("assignedTo") as ProjectDocument["assignedTo"] | null;
  const status = formData.get("status") as ProjectDocument["status"] | null;
  const isRequiredOriginal = formData.get("isRequiredOriginal") === "true";
  const notes = formData.get("notes") as string | null;

  // バリデーション
  if (!name || !name.trim()) {
    return { error: "書類名は必須です" };
  }

  if (!category || !['personal', 'employer', 'office', 'government', 'other'].includes(category)) {
    return { error: "カテゴリーは必須です" };
  }

  if (!source || !['office', 'applicant', 'employer', 'government', 'guarantor', 'other'].includes(source)) {
    return { error: "取得元は必須です" };
  }

  if (!assignedTo || !['office', 'applicant'].includes(assignedTo)) {
    return { error: "担当は必須です" };
  }

  if (!status || !['not_started', 'in_progress', 'waiting', 'collected', 'verified', 'completed'].includes(status)) {
    return { error: "ステータスは必須です" };
  }

  try {
    const documentId = await createDocument(projectId, {
      projectId,
      name: name.trim(),
      description: description?.trim() || undefined,
      category,
      source,
      assignedTo,
      status,
      isRequiredOriginal,
      notes: notes?.trim() || undefined,
    });

    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user) {
        await createActivityLog(projectId, {
          actionType: "document_created",
          description: `書類「${name.trim()}」を作成しました`,
          details: {
            documentId: documentId,
            documentName: name.trim(),
          },
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating document:", error);
    return { error: "書類の作成に失敗しました。もう一度お試しください。" };
  }
}

export async function searchCustomersAction(query: string) {
  await requireAuth();
  try {
    const { searchCustomers } = await import("@/lib/services/customerService");
    const customers = await searchCustomers(query);
    return { customers };
  } catch (error) {
    console.error("Error searching customers:", error);
    return { customers: [] };
  }
}

export async function updateProjectAction(
  id: string,
  formData: FormData
) {
  // 認証チェック
  await requireAuth();
  
  const title = formData.get("title") as string;
  const customerId = formData.get("customerId") as string;
  const visaType = formData.get("visaType") as string;
  const expiryDate = formData.get("expiryDate") as string | null;
  const status = formData.get("status") as Project["status"] | null;
  const paymentStatus = formData.get("paymentStatus") as Project["paymentStatus"] | null;

  // バリデーション
  if (!title || !title.trim()) {
    return { error: "案件名は必須です" };
  }
  if (!customerId || !customerId.trim()) {
    return { error: "顧客は必須です" };
  }
  if (!visaType || !visaType.trim()) {
    return { error: "在留資格は必須です" };
  }

  try {
    // 既存の案件情報を取得（変更前の値を記録するため）
    const existingProject = await getProject(id);
    
    await updateProject(id, {
      title: title.trim(),
      customerId: customerId.trim(),
      visaType: visaType.trim(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: status || 'pending',
      paymentStatus: paymentStatus || undefined,
    });

    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user && existingProject) {
        const changedFields: string[] = [];
        const details: Record<string, unknown> = {};
        
        if (title.trim() !== existingProject.title) {
          changedFields.push("案件名");
          details.title = { oldValue: existingProject.title, newValue: title.trim() };
        }
        if (customerId.trim() !== existingProject.customerId) {
          changedFields.push("顧客");
          // 顧客名を取得して表示
          const { getCustomer } = await import("@/lib/services/customerService");
          const oldCustomer = existingProject.customerId ? await getCustomer(existingProject.customerId) : null;
          const newCustomer = await getCustomer(customerId.trim());
          details.customerId = { 
            oldValue: oldCustomer?.name || existingProject.customerId, 
            newValue: newCustomer?.name || customerId.trim() 
          };
        }
        if (visaType.trim() !== existingProject.visaType) {
          changedFields.push("申請予定の資格");
          details.visaType = { oldValue: existingProject.visaType, newValue: visaType.trim() };
        }
        const newExpiryDate = expiryDate ? new Date(expiryDate) : null;
        const existingExpiryDate = existingProject.expiryDate ? (existingProject.expiryDate instanceof Date ? existingProject.expiryDate : existingProject.expiryDate.toDate()) : null;
        if ((newExpiryDate?.getTime() || null) !== (existingExpiryDate?.getTime() || null)) {
          changedFields.push("在留期限");
          details.expiryDate = { 
            oldValue: existingExpiryDate?.toISOString().split('T')[0] || null, 
            newValue: newExpiryDate?.toISOString().split('T')[0] || null 
          };
        }
        const newStatus = status || 'pending';
        if (newStatus !== existingProject.status) {
          changedFields.push("ステータス");
          details.status = { oldValue: existingProject.status, newValue: newStatus };
        }
        const newPaymentStatus = paymentStatus || undefined;
        if (newPaymentStatus !== existingProject.paymentStatus) {
          changedFields.push("入金ステータス");
          details.paymentStatus = { 
            oldValue: existingProject.paymentStatus || null, 
            newValue: newPaymentStatus || null 
          };
        }
        
        await createActivityLog(id, {
          actionType: "project_updated",
          description: changedFields.length > 0 
            ? `${changedFields.join("、")}を更新しました`
            : "案件情報を更新しました",
          details: details,
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    return { error: "案件の更新に失敗しました。もう一度お試しください。" };
  }
}

export async function updatePaymentStatusAction(
  id: string,
  paymentStatus: Project["paymentStatus"]
) {
  // 認証チェック
  await requireAuth();
  
  try {
    // 既存の案件情報を取得（変更前の値を記録するため）
    const existingProject = await getProject(id);
    
    if (!existingProject) {
      return { error: "案件が見つかりません" };
    }
    
    await updateProject(id, {
      paymentStatus: paymentStatus || undefined,
    });

    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user) {
        const getPaymentStatusLabel = (status: Project["paymentStatus"]): string => {
          switch (status) {
            case 'unclaimed':
              return '未請求';
            case 'claimed':
              return '請求済み';
            case 'paid':
              return '入金済み';
            default:
              return '未設定';
          }
        };
        
        const oldLabel = getPaymentStatusLabel(existingProject.paymentStatus);
        const newLabel = getPaymentStatusLabel(paymentStatus);
        
        await createActivityLog(id, {
          actionType: "project_updated",
          description: `入金ステータスを「${oldLabel}」から「${newLabel}」に変更しました`,
          details: {
            paymentStatus: {
              oldValue: existingProject.paymentStatus || null,
              newValue: paymentStatus || null,
            },
          },
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { error: "入金ステータスの更新に失敗しました。もう一度お試しください。" };
  }
}

export async function deleteProjectAction(id: string) {
  // 認証チェック
  await requireAuth();
  
  try {
    // 削除前に案件情報を取得（操作履歴記録用）
    const project = await getProject(id);
    
    // 操作履歴を記録（削除前に記録する必要がある）
    try {
      const user = await getCurrentUser();
      if (user && project) {
        await createActivityLog(id, {
          actionType: "project_deleted",
          description: `案件「${project.title}」を削除しました`,
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }
    
    await deleteProject(id);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { error: "案件の削除に失敗しました。もう一度お試しください。" };
  }
}

export async function addProjectNoteAction(
  projectId: string,
  content: string
) {
  // 認証チェック
  await requireAuth();
  
  if (!content || !content.trim()) {
    return { error: "メモの内容を入力してください" };
  }
  
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "ユーザー情報の取得に失敗しました" };
    }
    
    await addProjectNote(projectId, {
      content: content.trim(),
      authorName: user.displayName || user.email,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error adding project note:", error);
    return { error: "メモの追加に失敗しました。もう一度お試しください。" };
  }
}

/**
 * タスクを作成する
 * @param projectId 案件ID
 * @param formData フォームデータ
 * @returns 成功/失敗の結果
 */
export async function createTaskAction(
  projectId: string,
  formData: FormData
) {
  // 認証チェック
  await requireAuth();
  
  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const assigneeId = formData.get("assigneeId") as string | null;
  const status = formData.get("status") as TaskStatus | null;
  const priority = formData.get("priority") as Task["priority"] | null;
  const dueDate = formData.get("dueDate") as string | null;

  // バリデーション
  if (!title || !title.trim()) {
    return { error: "タスク名は必須です" };
  }

  if (!status || !['todo', 'in_progress', 'awaiting_approval', 'completed'].includes(status)) {
    return { error: "ステータスは必須です" };
  }

  if (!priority || !['high', 'medium', 'low'].includes(priority)) {
    return { error: "優先度は必須です" };
  }

  try {
    const taskId = await createTask(projectId, {
      title: title.trim(),
      description: description?.trim() || undefined,
      assigneeId: assigneeId?.trim() || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user) {
        await createActivityLog(projectId, {
          actionType: "task_created",
          description: `タスク「${title.trim()}」を作成しました`,
          details: {
            taskId: taskId,
            taskTitle: title.trim(),
          },
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating task:", error);
    return { error: "タスクの作成に失敗しました。もう一度お試しください。" };
  }
}

/**
 * タスクを更新する
 * @param projectId 案件ID
 * @param taskId タスクID
 * @param formData フォームデータ
 * @returns 成功/失敗の結果
 */
export async function updateTaskAction(
  projectId: string,
  taskId: string,
  formData: FormData
) {
  // 認証チェック
  await requireAuth();
  
  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const assigneeId = formData.get("assigneeId") as string | null;
  const status = formData.get("status") as TaskStatus | null;
  const priority = formData.get("priority") as Task["priority"] | null;
  const dueDate = formData.get("dueDate") as string | null;

  // バリデーション
  if (!title || !title.trim()) {
    return { error: "タスク名は必須です" };
  }

  if (!status || !['todo', 'in_progress', 'awaiting_approval', 'completed'].includes(status)) {
    return { error: "ステータスは必須です" };
  }

  if (!priority || !['high', 'medium', 'low'].includes(priority)) {
    return { error: "優先度は必須です" };
  }

  try {
    // 既存のタスク情報を取得（変更前の値を記録するため）
    const tasks = await getTasks(projectId);
    // 既存のタスク情報を取得（変更前の値を記録するため）
    tasks.find(t => t.id === taskId);
    
    await updateTask(projectId, taskId, {
      title: title.trim(),
      description: description?.trim() || undefined,
      assigneeId: assigneeId?.trim() || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    // 操作履歴を記録
    try {
      const user = await getCurrentUser();
      if (user) {
        await createActivityLog(projectId, {
          actionType: "task_updated",
          description: `タスク「${title.trim()}」を更新しました`,
          details: {
            taskId: taskId,
            taskTitle: title.trim(),
          },
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating task:", error);
    return { error: "タスクの更新に失敗しました。もう一度お試しください。" };
  }
}

/**
 * タスクを削除する
 * @param projectId 案件ID
 * @param taskId タスクID
 * @returns 成功/失敗の結果
 */
export async function deleteTaskAction(
  projectId: string,
  taskId: string
) {
  // 認証チェック
  await requireAuth();
  
  try {
    // 削除前にタスク情報を取得（操作履歴記録用）
    const tasks = await getTasks(projectId);
    const task = tasks.find(t => t.id === taskId);
    
    // 操作履歴を記録（削除前に記録する必要がある）
    try {
      const user = await getCurrentUser();
      if (user && task) {
        await createActivityLog(projectId, {
          actionType: "task_deleted",
          description: `タスク「${task.title}」を削除しました`,
          details: {
            taskId: taskId,
            taskTitle: task.title,
          },
          performedBy: user.id,
          performedByName: user.displayName,
        });
      }
    } catch (logError) {
      // 操作履歴の記録に失敗してもメイン処理は継続
      console.error("Error creating activity log:", logError);
    }
    
    await deleteTask(projectId, taskId);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { error: "タスクの削除に失敗しました。もう一度お試しください。" };
  }
}

/**
 * タスクのステータスをクイック更新する
 * @param projectId 案件ID
 * @param taskId タスクID
 * @param status 新しいステータス
 * @returns 成功/失敗の結果
 */
export async function updateTaskStatusAction(
  projectId: string,
  taskId: string,
  status: TaskStatus
) {
  // 認証チェック
  await requireAuth();
  
  // バリデーション
  if (!['todo', 'in_progress', 'awaiting_approval', 'completed'].includes(status)) {
    return { error: "無効なステータスです" };
  }

  try {
    await updateTask(projectId, taskId, { status });
    return { success: true };
  } catch (error) {
    console.error("Error updating task status:", error);
    return { error: "タスクのステータス更新に失敗しました。もう一度お試しください。" };
  }
}

/**
 * タスクの担当者をクイック更新する
 * @param projectId 案件ID
 * @param taskId タスクID
 * @param assigneeId 新しい担当者ID（null許可）
 * @returns 成功/失敗の結果
 */
export async function updateTaskAssigneeAction(
  projectId: string,
  taskId: string,
  assigneeId: string | null
) {
  // 認証チェック
  await requireAuth();
  
  try {
    await updateTask(projectId, taskId, { assigneeId: assigneeId || undefined });
    return { success: true };
  } catch (error) {
    console.error("Error updating task assignee:", error);
    return { error: "タスクの担当者更新に失敗しました。もう一度お試しください。" };
  }
}


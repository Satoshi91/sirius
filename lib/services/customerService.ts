import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  Timestamp,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  where,
  arrayUnion,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase";
import { auth } from "../firebase";
import { Customer, CustomerDocument, Note } from "@/types";

export async function getCustomers(): Promise<Customer[]> {
  try {
    const customersRef = collection(db, "customers");
    const q = query(customersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || {
          last: { en: "", ja: "", kana: "" },
          first: { en: "", ja: "", kana: "" },
        },
        nationality: data.nationality,
        birthday: data.birthday?.toDate() || null,
        gender: data.gender || null,
        residenceCardNumber: data.residenceCardNumber || null,
        expiryDate: data.expiryDate?.toDate() || null,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        chatNotes: data.chatNotes
          ? (data.chatNotes as Note[]).map((n) => ({
              id: n.id,
              content: n.content,
              createdAt:
                n.createdAt instanceof Timestamp
                  ? n.createdAt.toDate()
                  : n.createdAt instanceof Date
                    ? n.createdAt
                    : new Date(),
              authorName: n.authorName,
            }))
          : undefined,
        documents: data.documents
          ? (data.documents as CustomerDocument[]).map((d) => ({
              ...d,
              uploadedAt:
                d.uploadedAt instanceof Timestamp
                  ? d.uploadedAt.toDate()
                  : d.uploadedAt instanceof Date
                    ? d.uploadedAt
                    : new Date(),
            }))
          : undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Customer;
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

/**
 * 顧客一覧をページネーション対応で取得（ID降順）
 * @param limit 取得する件数
 * @param offset スキップする件数
 * @returns 顧客一覧と、次のページがあるかのフラグ
 */
export async function listCustomersPaginated(
  limit: number = 20,
  offset: number = 0
): Promise<{ customers: Customer[]; hasMore: boolean }> {
  try {
    const customersRef = collection(db, "customers");
    const q = query(customersRef);
    const querySnapshot = await getDocs(q);

    // 全件を取得してID降順にソート
    const allCustomers = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || {
          last: { en: "", ja: "", kana: "" },
          first: { en: "", ja: "", kana: "" },
        },
        nationality: data.nationality,
        birthday: data.birthday?.toDate() || null,
        gender: data.gender || null,
        residenceCardNumber: data.residenceCardNumber || null,
        expiryDate: data.expiryDate?.toDate() || null,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        chatNotes: data.chatNotes
          ? (data.chatNotes as Note[]).map((n) => ({
              id: n.id,
              content: n.content,
              createdAt:
                n.createdAt instanceof Timestamp
                  ? n.createdAt.toDate()
                  : n.createdAt instanceof Date
                    ? n.createdAt
                    : new Date(),
              authorName: n.authorName,
            }))
          : undefined,
        documents: data.documents
          ? (data.documents as CustomerDocument[]).map((d) => ({
              ...d,
              uploadedAt:
                d.uploadedAt instanceof Timestamp
                  ? d.uploadedAt.toDate()
                  : d.uploadedAt instanceof Date
                    ? d.uploadedAt
                    : new Date(),
            }))
          : undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Customer;
    });

    // ID降順にソート（文字列として比較）
    allCustomers.sort((a, b) => {
      return b.id.localeCompare(a.id);
    });

    // ページネーション
    const totalCount = allCustomers.length;
    const paginatedCustomers = allCustomers.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    return {
      customers: paginatedCustomers,
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching customers paginated:", error);
    return { customers: [], hasMore: false };
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const customerRef = doc(db, "customers", id);
    const customerSnap = await getDoc(customerRef);

    if (!customerSnap.exists()) {
      return null;
    }

    const data = customerSnap.data();
    return {
      id: customerSnap.id,
      name: data.name || {
        last: { en: "", ja: "", kana: "" },
        first: { en: "", ja: "", kana: "" },
      },
      nationality: data.nationality,
      birthday: data.birthday?.toDate() || null,
      gender: data.gender || null,
      residenceCardNumber: data.residenceCardNumber || null,
      expiryDate: data.expiryDate?.toDate() || null,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.notes,
      chatNotes: data.chatNotes
        ? (data.chatNotes as Note[]).map((n) => ({
            id: n.id,
            content: n.content,
            createdAt:
              n.createdAt instanceof Timestamp
                ? n.createdAt.toDate()
                : n.createdAt instanceof Date
                  ? n.createdAt
                  : new Date(),
            authorName: n.authorName,
          }))
        : undefined,
      documents: data.documents
        ? (data.documents as CustomerDocument[]).map((d) => ({
            ...d,
            uploadedAt:
              d.uploadedAt instanceof Timestamp
                ? d.uploadedAt.toDate()
                : d.uploadedAt instanceof Date
                  ? d.uploadedAt
                  : new Date(),
          }))
        : undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Customer;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

export async function getCustomersByIds(ids: string[]): Promise<Customer[]> {
  try {
    if (ids.length === 0) return [];

    // Firestoreの 'in' クエリは最大10件までなので、バッチ処理が必要
    const batches: string[][] = [];
    for (let i = 0; i < ids.length; i += 10) {
      batches.push(ids.slice(i, i + 10));
    }

    const customers: Customer[] = [];
    for (const batch of batches) {
      const customersRef = collection(db, "customers");
      const q = query(customersRef, where("__name__", "in", batch));
      const querySnapshot = await getDocs(q);

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        customers.push({
          id: doc.id,
          name: data.name || {
            last: { en: "", ja: "", kana: "" },
            first: { en: "", ja: "", kana: "" },
          },
          nationality: data.nationality,
          birthday: data.birthday?.toDate() || null,
          gender: data.gender || null,
          residenceCardNumber: data.residenceCardNumber || null,
          expiryDate: data.expiryDate?.toDate() || null,
          email: data.email,
          phone: data.phone,
          address: data.address,
          notes: data.notes,
          chatNotes: data.chatNotes
            ? (data.chatNotes as Note[]).map((n) => ({
                id: n.id,
                content: n.content,
                createdAt:
                  n.createdAt instanceof Timestamp
                    ? n.createdAt.toDate()
                    : n.createdAt instanceof Date
                      ? n.createdAt
                      : new Date(),
                authorName: n.authorName,
              }))
            : undefined,
          documents: data.documents
            ? (data.documents as CustomerDocument[]).map((d) => ({
                ...d,
                uploadedAt:
                  d.uploadedAt instanceof Timestamp
                    ? d.uploadedAt.toDate()
                    : d.uploadedAt instanceof Date
                      ? d.uploadedAt
                      : new Date(),
              }))
            : undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Customer);
      });
    }

    // 元の順序を保持するためにマップを作成
    const customerMap = new Map(customers.map((c) => [c.id, c]));
    return ids
      .map((id) => customerMap.get(id))
      .filter((c): c is Customer => c !== undefined);
  } catch (error) {
    console.error("Error fetching customers by ids:", error);
    return [];
  }
}

export async function createCustomer(
  data: Omit<Customer, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const customersRef = collection(db, "customers");
    const now = Timestamp.now();

    const customerData: Record<string, unknown> = {
      name: data.name,
      nationality: data.nationality,
      createdAt: now,
      updatedAt: now,
    };

    // Only include optional fields if they have values (Firebase rejects undefined)
    if (data.birthday !== undefined && data.birthday !== null) {
      customerData.birthday =
        data.birthday instanceof Date
          ? Timestamp.fromDate(data.birthday)
          : data.birthday;
    }
    if (data.gender !== undefined && data.gender !== null) {
      customerData.gender = data.gender;
    }
    if (
      data.residenceCardNumber !== undefined &&
      data.residenceCardNumber !== null
    ) {
      customerData.residenceCardNumber = data.residenceCardNumber;
    }
    if (data.expiryDate !== undefined && data.expiryDate !== null) {
      customerData.expiryDate =
        data.expiryDate instanceof Date
          ? Timestamp.fromDate(data.expiryDate)
          : data.expiryDate;
    }
    if (data.email !== undefined && data.email !== null) {
      customerData.email = data.email;
    }
    if (data.phone !== undefined && data.phone !== null) {
      customerData.phone = data.phone;
    }
    if (data.address !== undefined && data.address !== null) {
      customerData.address = data.address;
    }
    if (data.notes !== undefined && data.notes !== null) {
      customerData.notes = data.notes;
    }

    const docRef = await addDoc(customersRef, customerData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}

export async function updateCustomer(
  id: string,
  data: Partial<Omit<Customer, "id" | "createdAt">>
): Promise<void> {
  try {
    const customerRef = doc(db, "customers", id);
    const now = Timestamp.now();

    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.nationality !== undefined)
      updateData.nationality = data.nationality;
    if (data.birthday !== undefined) {
      updateData.birthday = data.birthday
        ? data.birthday instanceof Date
          ? Timestamp.fromDate(data.birthday)
          : data.birthday
        : null;
    }
    if (data.gender !== undefined) updateData.gender = data.gender || null;
    if (data.residenceCardNumber !== undefined)
      updateData.residenceCardNumber = data.residenceCardNumber || null;
    if (data.expiryDate !== undefined) {
      updateData.expiryDate = data.expiryDate
        ? data.expiryDate instanceof Date
          ? Timestamp.fromDate(data.expiryDate)
          : data.expiryDate
        : null;
    }
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    await updateDoc(customerRef, updateData);
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    const customerRef = doc(db, "customers", id);
    await deleteDoc(customerRef);
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
}

export async function searchCustomers(
  queryString: string
): Promise<Customer[]> {
  try {
    if (!queryString.trim()) {
      return await getCustomers();
    }

    const allCustomers = await getCustomers();

    // クライアント側でフィルタリング（Firestoreの部分一致検索は複雑なため）
    const lowerQuery = queryString.toLowerCase();
    return allCustomers.filter((customer) => {
      return (
        (customer.name?.last?.en &&
          customer.name.last.en.toLowerCase().includes(lowerQuery)) ||
        (customer.name?.first?.en &&
          customer.name.first.en.toLowerCase().includes(lowerQuery)) ||
        (customer.name?.last?.ja &&
          customer.name.last.ja.includes(queryString)) ||
        (customer.name?.first?.ja &&
          customer.name.first.ja.includes(queryString)) ||
        (customer.name?.last?.kana &&
          customer.name.last.kana.includes(queryString)) ||
        (customer.name?.first?.kana &&
          customer.name.first.kana.includes(queryString)) ||
        (customer.nationality &&
          customer.nationality.toLowerCase().includes(lowerQuery)) ||
        customer.email?.toLowerCase().includes(lowerQuery) ||
        (customer.phone && customer.phone.includes(queryString)) ||
        (customer.residenceCardNumber &&
          customer.residenceCardNumber.includes(queryString))
      );
    });
  } catch (error) {
    console.error("Error searching customers:", error);
    return [];
  }
}

/**
 * 顧客の重要書類ファイルをCloud Storageにアップロードする（メタデータ保存は行わない）
 * @param customerId 顧客ID
 * @param file アップロードするファイル
 * @returns アップロード結果（fileUrl, storagePath, uuid）
 */
export async function uploadCustomerDocumentFile(
  customerId: string,
  file: File
): Promise<{ fileUrl: string; storagePath: string; uuid: string }> {
  try {
    // UUIDを生成してファイル名を作成
    const uuid = crypto.randomUUID();
    const fileExtension = file.name.split(".").pop() || "";
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const fileName = `${fileNameWithoutExt}_${uuid}.${fileExtension}`;
    const storagePath = `customers/${customerId}/documents/${fileName}`;

    // Cloud Storageにアップロード
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);

    // ダウンロードURLを取得
    const fileUrl = await getDownloadURL(storageRef);

    return { fileUrl, storagePath, uuid };
  } catch (error) {
    console.error("Error uploading customer document file:", error);
    throw error;
  }
}

/**
 * 顧客の重要書類メタデータをFirestoreに保存する（既にアップロード済みのファイル用）
 * @param customerId 顧客ID
 * @param documentData ドキュメントデータ（uploadedAtは不要、サーバー側で自動設定される）
 * @returns 作成されたドキュメントID
 */
export async function saveCustomerDocumentMetadata(
  customerId: string,
  documentData: Omit<CustomerDocument, "uploadedAt">
): Promise<string> {
  try {
    const customerRef = doc(db, "customers", customerId);
    const now = Timestamp.now();

    // 既存のdocuments配列を取得して追加
    const customerSnap = await getDoc(customerRef);
    const existingData = customerSnap.data();
    const existingDocuments = existingData?.documents || [];

    await updateDoc(customerRef, {
      documents: [...existingDocuments, { ...documentData, uploadedAt: now }],
      updatedAt: now,
    });

    return documentData.id;
  } catch (error) {
    console.error("Error saving customer document metadata:", error);
    throw error;
  }
}

/**
 * 顧客の重要書類をCloud Storageにアップロードし、Firestoreにメタデータを保存する
 * @param customerId 顧客ID
 * @param file アップロードするファイル
 * @param label ラベル（例：「パスポート」「在留カード表面」）
 * @returns 作成されたドキュメントID
 */
export async function uploadCustomerDocument(
  customerId: string,
  file: File,
  label: string
): Promise<string> {
  try {
    // #region agent log
    const currentUser = auth.currentUser;
    const userEmail = currentUser?.email || null;
    const userId = currentUser?.uid || null;
    let tokenEmail: string | null = null;
    let tokenHasEmailClaim: boolean = false;
    if (currentUser) {
      try {
        // カスタムクレームを反映させるために強制的にトークンを再取得
        const token = await currentUser.getIdToken(true);
        const payload = JSON.parse(atob(token.split(".")[1]));
        tokenEmail = payload.email || null;
        // カスタムクレームのemailを確認
        tokenHasEmailClaim = payload.email != null;
        fetch(
          "http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "customerService.ts:293",
              message: "uploadCustomerDocument start",
              data: {
                customerId,
                fileName: file.name,
                userEmail,
                userId,
                tokenEmail,
                tokenHasEmailClaim,
                hasAuth: !!currentUser,
              },
              timestamp: Date.now(),
              sessionId: "debug-session",
              runId: "run2",
              hypothesisId: "A",
            }),
          }
        ).catch(() => {});
      } catch (e) {
        fetch(
          "http://127.0.0.1:7242/ingest/3d25e911-5548-4daa-8038-5ea7ce13809a",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "customerService.ts:293",
              message: "token error",
              data: { error: String(e) },
              timestamp: Date.now(),
              sessionId: "debug-session",
              runId: "run2",
              hypothesisId: "A",
            }),
          }
        ).catch(() => {});
      }
    }
    // #endregion

    // 新しい関数を使用してアップロードとメタデータ保存を行う
    const { fileUrl, storagePath, uuid } = await uploadCustomerDocumentFile(
      customerId,
      file
    );

    const documentData: CustomerDocument = {
      id: uuid,
      label: label,
      fileUrl: fileUrl,
      storagePath: storagePath,
      fileName: file.name,
      uploadedAt: Timestamp.now(),
    };

    await saveCustomerDocumentMetadata(customerId, documentData);

    return uuid;
  } catch (error) {
    console.error("Error uploading customer document:", error);
    throw error;
  }
}

/**
 * 顧客の重要書類を削除する
 * @param customerId 顧客ID
 * @param documentId 削除するドキュメントID
 */
export async function deleteCustomerDocument(
  customerId: string,
  documentId: string
): Promise<void> {
  try {
    // 顧客ドキュメントを取得
    const customerRef = doc(db, "customers", customerId);
    const customerSnap = await getDoc(customerRef);

    if (!customerSnap.exists()) {
      throw new Error("Customer not found");
    }

    const data = customerSnap.data();
    const documents = (data.documents || []) as CustomerDocument[];

    // 削除対象のドキュメントを検索
    const documentToDelete = documents.find((doc) => doc.id === documentId);

    if (!documentToDelete) {
      throw new Error("Document not found");
    }

    // Storageからファイルを削除
    const storageRef = ref(storage, documentToDelete.storagePath);
    await deleteObject(storageRef);

    // Firestoreのdocuments配列から該当項目を削除
    const updatedDocuments = documents.filter((doc) => doc.id !== documentId);
    const now = Timestamp.now();

    await updateDoc(customerRef, {
      documents: updatedDocuments,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error deleting customer document:", error);
    throw error;
  }
}

/**
 * 顧客にメモを追加する
 * @param customerId 顧客ID
 * @param note 追加するメモ
 */
export async function addCustomerNote(
  customerId: string,
  note: Omit<Note, "id" | "createdAt">
): Promise<void> {
  try {
    const customerRef = doc(db, "customers", customerId);
    const now = Timestamp.now();

    const newNote: Note = {
      id: crypto.randomUUID(),
      content: note.content,
      createdAt: now,
      authorName: note.authorName,
    };

    await updateDoc(customerRef, {
      chatNotes: arrayUnion(newNote),
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error adding customer note:", error);
    throw error;
  }
}

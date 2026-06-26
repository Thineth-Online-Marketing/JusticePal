const BASE_URL = "http://localhost:5000/api";
const TEST_EMAIL = "testclient_api_verify@justicepal.com";
const idToken = "api-test-token";

async function runTest() {
  console.log("Starting E2E API Verification for Case Files (using Test Rig)...");

  // 1. Sync User to Postgres
  console.log("Syncing test user with PostgreSQL backend...");
  const syncRes = await fetch(`${BASE_URL}/auth/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      name: "API Tester Client",
      role: "client",
    }),
  });

  if (!syncRes.ok) {
    const errText = await syncRes.text();
    throw new Error(`User sync failed: ${errText}`);
  }
  const syncData = await syncRes.json();
  console.log("User synchronized in database:", syncData);

  // 2. Upload Case File (will trigger fallback Try-Catch block)
  console.log("Testing POST /api/case-files (File Upload)...");
  const testFileBase64 = Buffer.from("JUSTICEPAL SECURE DOCUMENT - VERIFICATION SUCCESSFUL").toString('base64');
  const uploadRes = await fetch(`${BASE_URL}/case-files`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      name: "verification_test_deed.txt",
      fileContent: testFileBase64,
      fileType: "text/plain",
      fileSize: testFileBase64.length,
    }),
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Upload endpoint failed: ${errText}`);
  }
  const uploadedFile = await uploadRes.json() as any;
  console.log("Upload response successfully received. File Metadata:", uploadedFile);
  console.log("Generated fallback secure Data URL length:", uploadedFile.url.length);

  // 3. List Case Files
  console.log("Testing GET /api/case-files (List Files)...");
  const listRes = await fetch(`${BASE_URL}/case-files`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!listRes.ok) {
    const errText = await listRes.text();
    throw new Error(`List endpoint failed: ${errText}`);
  }
  const fileList = await listRes.json() as any[];
  console.log(`Retrieved ${fileList.length} files. Listing contents:`);
  fileList.forEach(file => {
    console.log(`- ID: ${file.id}, Name: ${file.name}, UploadedBy: ${file.uploadedBy}, Size: ${file.fileSize} bytes`);
  });

  const matchingFile = fileList.find(f => f.id === uploadedFile.id);
  if (!matchingFile) {
    throw new Error("Uploaded file was not found in listing!");
  }
  console.log("Listing verification: SUCCESS!");

  // 4. Delete Case File
  console.log(`Testing DELETE /api/case-files/${uploadedFile.id} (File Delete)...`);
  const deleteRes = await fetch(`${BASE_URL}/case-files/${uploadedFile.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!deleteRes.ok) {
    const errText = await deleteRes.text();
    throw new Error(`Delete endpoint failed: ${errText}`);
  }
  const deleteResult = await deleteRes.json();
  console.log("Delete result:", deleteResult);

  // 5. Verify file is gone from list
  console.log("Verifying file is removed from list...");
  const listAfterDeleteRes = await fetch(`${BASE_URL}/case-files`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  const fileListAfter = await listAfterDeleteRes.json() as any[];
  const stillExists = fileListAfter.some(f => f.id === uploadedFile.id);
  if (stillExists) {
    throw new Error("File still exists in DB listing after deletion!");
  }
  console.log("Deletion listing verification: SUCCESS!");

  console.log("Case File storage and API flow successfully verified end-to-end via Test Rig!");
}

runTest()
  .catch((e) => {
    console.error("Test failed with error:", e);
    process.exit(1);
  });

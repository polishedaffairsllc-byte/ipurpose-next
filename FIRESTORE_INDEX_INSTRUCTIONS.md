# Firestore Composite Index Required

During local runtime you saw this error indicating Firestore requires a composite index for a query:

`The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/ipurpose-mvp/firestore/indexes?create_composite=ClRwcm9qZWN0cy9pcHVycG9zZS1tdnAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NvbW11bml0eV9wb3N0cy9pbmRleGVzL18QARoMCghzcGFjZUtleRABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI`

To resolve:
1. Open the provided URL (or visit the Firestore Indexes console for project `ipurpose-mvp`).
2. Confirm the suggested composite index and create it. Firestore will begin building the index (can take a few minutes).
3. Once the index is built, rerun the request that previously triggered the error.

If you prefer, I can add a short script or README entry that collects these index URLs automatically from logs and surfaces them. Reply `index-script` if you'd like that.

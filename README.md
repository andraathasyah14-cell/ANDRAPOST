# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Backup & Disaster Recovery

While Firebase and Vercel provide robust, enterprise-grade infrastructure, it's a good practice to maintain your own backups, especially for critical data stored in Firestore.

### Manual Backups (Exports)

You can perform manual exports of your Firestore database using the `gcloud` command-line tool. This is useful for creating periodic snapshots of your data.

1.  **Authenticate with gcloud:**
    ```bash
    gcloud auth login
    ```

2.  **Set your project:**
    ```bash
    gcloud config set project [YOUR_PROJECT_ID]
    ```
    (Replace `[YOUR_PROJECT_ID]` with your actual Firebase Project ID).

3.  **Create a Cloud Storage bucket for backups (if you don't have one):**
    ```bash
    gsutil mb -p [YOUR_PROJECT_ID] gs://[BUCKET_NAME]
    ```
    (Replace `[BUCKET_NAME]` with a globally unique name, e.g., `[YOUR_PROJECT_ID]-backups`).

4.  **Export the database:**
    ```bash
    gcloud firestore export gs://[BUCKET_NAME]
    ```
    This will export your entire Firestore database to the specified bucket. You can also specify certain collections to export.

### Automated Backups

For automated, point-in-time recovery, you should enable the **Point-in-Time Recovery (PITR)** feature in the Google Cloud console for your Firestore database. This feature allows you to restore your database to any microsecond within the last 7 days (or up to 35 days with extended retention). This is the recommended approach for production applications.

Refer to the official Firebase documentation for detailed instructions on [enabling PITR](https://firebase.google.com/docs/firestore/manage-data/pitr) and [importing/exporting data](https://firebase.google.com/docs/firestore/manage-data/export-import).
# ANDRAPOST

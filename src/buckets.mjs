import * as core from '@actions/core';
import { forEachSeries } from 'modern-async';

async function deleteBucket(id, supabase) {
    core.info(`Delete Bucket: ${id}`);

    // Check if bucket exists
    const { data: bucket, error: getError } = await supabase.storage.getBucket(id);

    if (getError && getError.statusCode === 404) {
        core.info(`Delete Bucket: ${id} not found, skipping...`);
        return true;
    }

    if (getError) {
        core.warning(`Error checking bucket ${id}: ${getError.message}`);
        return false;
    }

    if (bucket) {
        core.info(`Found Bucket: ${id} deleting...`);

        // List and delete all objects in the bucket first
        const { data: files, error: listError } = await supabase.storage.from(id).list();

        if (listError) {
            core.warning(`Error listing objects in bucket ${id}: ${listError.message}`);
        } else if (files && files.length > 0) {
            const filePaths = files.map(file => file.name);
            const { error: deleteFilesError } = await supabase.storage.from(id).remove(filePaths);

            if (deleteFilesError) {
                core.warning(`Error deleting objects from bucket ${id}: ${deleteFilesError.message}`);
            }
        }

        // Delete the bucket
        const { error: deleteBucketError } = await supabase.storage.deleteBucket(id);

        if (deleteBucketError) {
            core.warning(`Error deleting bucket ${id}: ${deleteBucketError.message}`);
            return false;
        }

        core.info(`Successfully deleted bucket: ${id}`);
    }

    return true;
}

export default async function run(buckets, supabase) {
    await forEachSeries(buckets, async (bucket) => {
        return deleteBucket(bucket, supabase);
    })
}

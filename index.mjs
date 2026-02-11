import * as core from '@actions/core';
import * as github from '@actions/github';
import * as pg from 'pg';
const { Client } = pg.default;
import { createClient } from '@supabase/supabase-js';

import runEnum from './src/enums.mjs';
import runTablesAndViews from './src/tables-and-views.mjs';
import runFunctions from './src/functions.mjs';
import runMigrations from './src/migrations.mjs';
import runBuckets from './src/buckets.mjs';
import runPolicies from './src/policies.mjs';
import runUsers from './src/users.mjs';
import runExtensions from './src/extensions.mjs';

async function run() {
	const users = core.getInput('users').split(',');
	const buckets = core.getInput('buckets').split(',');
	const extensions = core.getInput('extensions').split(',');

	const c = new Client({
		connectionString: core.getInput('connectionString'),
	});
	await c.connect();

	// Create Supabase client for Storage API
	const supabaseUrl = core.getInput('supabaseUrl');
	const supabaseServiceKey = core.getInput('supabaseServiceKey');
	const supabase = createClient(supabaseUrl, supabaseServiceKey);

	// Disable needed extensions
	await runExtensions(extensions, c);

	// Find all tables and views in the public schema
	await runTablesAndViews(c);

	// Find all Enums in the public schema
	await runEnum(c);

	// Find all Functions in the public schema
	await runFunctions(c);

	// Clear the migrations table
	await runMigrations(c);

	// Clear out the buckets
	await runBuckets(buckets, supabase);

	// Delete policies
	await runPolicies(c);

	// Delete all the included users
	await runUsers(users, c);

	await c.end()
}

try {
	run();
} catch (error) {
	core.setFailed(error.message);
}

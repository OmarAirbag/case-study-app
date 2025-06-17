import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Admin SDK
const app = initializeApp({
  credential: cert('./service-account-key.json')
});

const db = getFirestore();
const auth = getAuth();

interface MigrationResult {
  success: string[];
  failed: Array<{ userId: string; error: string }>;
}

/**
 * Migrate existing users to organizations system
 * This script should be run once to migrate all existing users
 */
async function migrateToOrganizations(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: [],
    failed: []
  };

  console.log('Starting migration to organizations...');

  try {
    // 1. Get all existing users
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users to migrate`);

    // 2. Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      try {
        console.log(`Migrating user ${userId} (${userData.email})...`);

        // 3. Create personal organization for user
        const orgId = await createPersonalOrganization(userId, userData);

        // 4. Migrate all user's case studies
        await migrateCaseStudies(userId, orgId);

        // 5. Update user document
        await updateUserDocument(userId, orgId);

        result.success.push(userId);
        console.log(`✅ Successfully migrated user ${userId}`);

      } catch (error) {
        console.error(`❌ Failed to migrate user ${userId}:`, error);
        result.failed.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 6. Summary
    console.log('\nMigration completed!');
    console.log(`✅ Success: ${result.success.length} users`);
    console.log(`❌ Failed: ${result.failed.length} users`);

    if (result.failed.length > 0) {
      console.log('\nFailed migrations:');
      result.failed.forEach(f => {
        console.log(`- User ${f.userId}: ${f.error}`);
      });
    }

    return result;

  } catch (error) {
    console.error('Fatal error during migration:', error);
    throw error;
  }
}

async function createPersonalOrganization(
  userId: string, 
  userData: any
): Promise<string> {
  const batch = db.batch();
  const orgId = db.collection('organizations').doc().id;

  // Determine organization name
  const orgName = userData.profile?.company || 
                  userData.displayName || 
                  userData.email?.split('@')[0] || 
                  'Personal Workspace';

  // Create organization document
  const orgRef = db.collection('organizations').doc(orgId);
  batch.set(orgRef, {
    name: `${orgName}'s Workspace`,
    description: 'Migrated personal workspace',
    ownerId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    subscription: {
      plan: userData.personalSubscription?.plan || 'free',
      validUntil: userData.personalSubscription?.validUntil || null,
      seats: 1
    },
    settings: {
      maxMembers: 1,
      maxCaseStudies: userData.personalSubscription?.plan === 'pro' ? 100 : 10,
      features: userData.personalSubscription?.plan === 'pro' 
        ? ['basic_templates', 'advanced_templates', 'html_export', 'pdf_export', 'custom_branding']
        : ['basic_templates', 'html_export'],
      defaultRole: 'member',
      allowMemberInvite: false
    },
    metadata: {
      migrated: true,
      migrationDate: new Date(),
      originalUserId: userId
    }
  });

  // Create membership document
  const memberRef = db.collection('organizationMembers').doc(`${userId}_${orgId}`);
  batch.set(memberRef, {
    orgId,
    userId,
    role: 'owner',
    joinedAt: new Date(),
    invitedBy: userId,
    user: {
      email: userData.email,
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || ''
    }
  });

  // Create migration event
  const eventRef = db.collection('organizationEvents').doc();
  batch.set(eventRef, {
    orgId,
    userId,
    userEmail: userData.email,
    action: 'org_created',
    metadata: {
      type: 'migration',
      source: 'migration_script'
    },
    createdAt: new Date()
  });

  await batch.commit();
  return orgId;
}

async function migrateCaseStudies(userId: string, orgId: string): Promise<void> {
  // Get all case studies for user
  const caseStudiesSnapshot = await db.collection('caseStudies')
    .where('userId', '==', userId)
    .get();

  if (caseStudiesSnapshot.empty) {
    console.log(`  No case studies found for user ${userId}`);
    return;
  }

  console.log(`  Migrating ${caseStudiesSnapshot.size} case studies...`);

  const batch = db.batch();
  let batchCount = 0;

  for (const doc of caseStudiesSnapshot.docs) {
    const caseStudyRef = db.collection('caseStudies').doc(doc.id);
    
    // Add orgId and createdBy fields
    batch.update(caseStudyRef, {
      orgId: orgId,
      createdBy: userId,
      migratedAt: new Date()
    });

    batchCount++;

    // Firestore batch limit is 500
    if (batchCount === 499) {
      await batch.commit();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }
}

async function updateUserDocument(userId: string, orgId: string): Promise<void> {
  await db.collection('users').doc(userId).update({
    currentOrgId: orgId,
    personalOrgId: orgId,
    organizations: [orgId],
    migratedToOrganizations: true,
    migrationDate: new Date()
  });
}

// Rollback function in case of issues
async function rollbackMigration(userId: string): Promise<void> {
  console.log(`Rolling back migration for user ${userId}...`);

  // Get user's personal org
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData?.personalOrgId) {
    console.log('No personal org found, nothing to rollback');
    return;
  }

  const orgId = userData.personalOrgId;
  const batch = db.batch();

  // Remove orgId from case studies
  const caseStudies = await db.collection('caseStudies')
    .where('orgId', '==', orgId)
    .get();

  caseStudies.forEach(doc => {
    batch.update(doc.ref, {
      orgId: null,
      createdBy: null,
      migratedAt: null
    });
  });

  // Delete organization
  batch.delete(db.collection('organizations').doc(orgId));

  // Delete membership
  batch.delete(db.collection('organizationMembers').doc(`${userId}_${orgId}`));

  // Update user document
  batch.update(db.collection('users').doc(userId), {
    currentOrgId: null,
    personalOrgId: null,
    organizations: [],
    migratedToOrganizations: false,
    migrationDate: null
  });

  await batch.commit();
  console.log('Rollback completed');
}

// Run migration
if (require.main === module) {
  migrateToOrganizations()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateToOrganizations, rollbackMigration };
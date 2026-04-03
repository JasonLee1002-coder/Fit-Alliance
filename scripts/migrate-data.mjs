/**
 * Migrate Family Health Center data into Fit Alliance (Supabase fa_ tables)
 *
 * Maps old TiDB/MySQL user IDs to Supabase auth UUIDs.
 * Since users need to sign up via Google OAuth in the new system,
 * we create placeholder fa_users entries using a deterministic UUID
 * derived from the old user ID, then insert their health records.
 *
 * When users actually sign up, we'll match by email and merge data.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { randomUUID } from 'crypto'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://yxndipwshjzfswewobez.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bmRpcHdzaGp6ZnN3ZXdvYmV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3MjUzOCwiZXhwIjoyMDg4NzQ4NTM4fQ.Hrxk8B6Y9V7U1g7nuHaIl2RLyqUVSowHO5VRB5CBRRc'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Read export
const raw = readFileSync(process.env.LOCALAPPDATA + '/Temp/fhc-export/db-export.json', 'utf-8')
const data = JSON.parse(raw)
const tables = data.tables

// Generate deterministic UUID from old user ID
function oldIdToUuid(oldId) {
  const hash = createHash('sha256').update(`fhc-user-${oldId}`).digest('hex')
  // Format as UUID v4-like
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16),
    '8' + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join('-')
}

// Map old IDs to UUIDs
const userIdMap = new Map()

async function migrateUsers() {
  console.log('=== Migrating users ===')
  const users = tables.users.rows

  for (const u of users) {
    const uuid = oldIdToUuid(u.id)
    userIdMap.set(u.id, uuid)

    // Create auth user first (using admin API)
    const email = u.email || `user-${u.id}@fit-alliance.local`

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: u.name,
        avatar_url: u.avatarUrl,
      },
    })

    let finalUuid = uuid
    if (authUser?.user) {
      finalUuid = authUser.user.id
      userIdMap.set(u.id, finalUuid)
      console.log(`  Created auth user: ${u.name} (${email}) -> ${finalUuid}`)
    } else if (authError) {
      // User might already exist (e.g., from FeedBites)
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existing = existingUsers?.users?.find(eu => eu.email === email)
      if (existing) {
        finalUuid = existing.id
        userIdMap.set(u.id, finalUuid)
        console.log(`  Found existing auth user: ${u.name} (${email}) -> ${finalUuid}`)
      } else {
        console.log(`  Auth error for ${u.name}: ${authError.message}, using generated UUID`)
      }
    }

    // Insert fa_users profile
    const { error } = await supabase.from('fa_users').upsert({
      id: finalUuid,
      email,
      name: u.name || '',
      avatar_url: u.avatarUrl || null,
      gender: u.gender === 'other' ? null : u.gender || null,
      birthday: u.birthday || null,
      height_cm: u.height ? parseFloat(u.height) : null,
      profile_completed: u.profileCompleted === 1,
      role: u.role || 'user',
    }, { onConflict: 'id' })

    if (error) console.log(`  Profile error for ${u.name}: ${error.message}`)
    else console.log(`  Profile OK: ${u.name}`)
  }
}

async function migrateWeightRecords() {
  console.log('\n=== Migrating weight records ===')
  const records = tables.weight_records.rows
  let count = 0

  for (const r of records) {
    const userId = userIdMap.get(r.userId)
    if (!userId) {
      console.log(`  Skipping record ${r.id}: no user mapping for userId ${r.userId}`)
      continue
    }

    const { error } = await supabase.from('fa_health_records').insert({
      user_id: userId,
      date: r.recordDate,
      weight: r.weight ? parseFloat(r.weight) : null,
      body_fat: r.bodyFatRate ? parseFloat(r.bodyFatRate) : null,
      muscle_mass: r.muscleMass ? parseFloat(r.muscleMass) : null,
      visceral_fat: r.visceralFat ? parseFloat(r.visceralFat) : null,
      bone_mass: r.boneMass ? parseFloat(r.boneMass) : null,
      bmr: r.bmr ? parseFloat(r.bmr) : null,
      bmi: r.bmi ? parseFloat(r.bmi) : null,
      screenshot_url: r.imageUrl || null,
      ai_ocr_result: r.rawOcrData || null,
    })

    if (error) console.log(`  Record error: ${error.message}`)
    else count++
  }
  console.log(`  Migrated ${count} / ${records.length} weight records`)
}

async function migrateChallenges() {
  console.log('\n=== Migrating challenges ===')
  const challenges = tables.challenges.rows
  const challengeIdMap = new Map()

  for (const c of challenges) {
    const creatorId = userIdMap.get(c.creatorId)
    if (!creatorId) continue

    const { data: inserted, error } = await supabase.from('fa_challenges').insert({
      name: c.name,
      creator_id: creatorId,
      start_date: c.startDate,
      end_date: c.endDate,
      prize_description: c.prize || null,
      status: c.status === 'active' ? 'active' : c.status === 'ended' ? 'ended' : 'upcoming',
    }).select().single()

    if (inserted) {
      challengeIdMap.set(c.id, inserted.id)
      console.log(`  Challenge: ${c.name} -> ${inserted.id}`)
    } else if (error) {
      console.log(`  Challenge error: ${error.message}`)
    }
  }

  // Migrate participants
  console.log('\n=== Migrating challenge participants ===')
  const participants = tables.challenge_participants.rows
  for (const p of participants) {
    const challengeId = challengeIdMap.get(p.challengeId)
    const userId = userIdMap.get(p.userId)
    if (!challengeId || !userId) continue

    const { error } = await supabase.from('fa_challenge_participants').insert({
      challenge_id: challengeId,
      user_id: userId,
      target_type: p.goalType?.includes('percent') ? 'reduce_percent' : 'reduce_absolute',
      target_value: p.goalValue ? parseFloat(p.goalValue) : 5,
      start_value: p.startValue ? parseFloat(p.startValue) : null,
      current_value: p.currentValue ? parseFloat(p.currentValue) : null,
      personal_goal: p.personalGoal || null,
    })
    if (error) console.log(`  Participant error: ${error.message}`)
  }

  // Migrate messages
  console.log('\n=== Migrating challenge messages ===')
  const messages = tables.challenge_messages.rows
  let msgCount = 0
  for (const m of messages) {
    const challengeId = challengeIdMap.get(m.challengeId)
    const userId = m.isAI ? null : userIdMap.get(m.userId)
    if (!challengeId) continue

    const { error } = await supabase.from('fa_group_messages').insert({
      challenge_id: challengeId,
      user_id: userId || null,
      content: m.content,
      is_ai: m.isAI === 1,
      sender_name: m.senderName || 'AI',
      sender_avatar: m.senderAvatar || null,
    })
    if (!error) msgCount++
  }
  console.log(`  Migrated ${msgCount} messages`)

  return challengeIdMap
}

async function migrateMemberRelationships() {
  console.log('\n=== Migrating member relationships ===')
  const rels = tables.member_relationships.rows
  for (const r of rels) {
    const fromId = userIdMap.get(r.fromUserId)
    const toId = userIdMap.get(r.toUserId)
    if (!fromId || !toId) continue

    await supabase.from('fa_member_relationships').upsert({
      from_user_id: fromId,
      to_user_id: toId,
      label: r.label,
    }, { onConflict: 'from_user_id,to_user_id' })
  }
  console.log(`  Done: ${rels.length} relationships`)
}

async function migrateDevReports() {
  console.log('\n=== Migrating dev reports ===')
  const reports = tables.dev_reports.rows
  for (const r of reports) {
    const userId = userIdMap.get(r.userId)
    if (!userId) continue

    const typeMap = { bug: 'bug', feature_request: 'feature', ux_issue: 'ux', display: 'display' }

    await supabase.from('fa_dev_reports').insert({
      user_id: userId,
      type: typeMap[r.type] || 'other',
      description: r.description || '',
      screenshot_urls: r.screenshotUrls ? JSON.parse(r.screenshotUrls) : null,
      status: r.status || 'open',
    })
  }
  console.log(`  Done: ${reports.length} reports`)
}

// Run migration
async function main() {
  console.log('Starting Fit Alliance data migration...\n')

  await migrateUsers()
  await migrateWeightRecords()
  await migrateChallenges()
  await migrateMemberRelationships()
  await migrateDevReports()

  console.log('\n✅ Migration complete!')
  console.log('\nUser ID mapping:')
  for (const [oldId, newId] of userIdMap) {
    console.log(`  ${oldId} -> ${newId}`)
  }
}

main().catch(console.error)

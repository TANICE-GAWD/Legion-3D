# Fixing ElevenLabs Agent ID Issues

## Problem Identified
The error `GET https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=agent_4601kf84fzyze3wtk6s0v1p05rhp 404 (Not Found)` indicates that the agent ID in your database doesn't exist in your ElevenLabs account.

## Solutions

### Option 1: Use a Valid Agent ID (Recommended)

1. **Go to your ElevenLabs Dashboard**:
   - Visit [ElevenLabs.io](https://elevenlabs.io)
   - Log in to your account
   - Navigate to "Conversational AI" or "Agents" section

2. **Find or Create an Agent**:
   - Look for existing agents in your dashboard
   - Copy a valid agent ID (format: `agent_xxxxxxxxxxxxxxxxxxxxxxxxx`)
   - Or create a new agent if you don't have any

3. **Update Your Database**:
   - Update the avatar record in your Supabase database
   - Set the `agent_id` field to a valid ElevenLabs agent ID
   ```sql
   UPDATE avatars 
   SET agent_id = 'your_valid_agent_id_here' 
   WHERE id = 'your_avatar_id';
   ```

### Option 2: Test with Known Working Agent

1. **Use the Test Page**:
   - Go to `http://localhost:3000/simli-test`
   - Switch to "ElevenLabs + Simli" mode
   - Try the default test agent ID: `agent_1201kfk7960ffzt94m5jr0cfhqx4`
   - The page will validate if the agent exists

2. **If Test Agent Works**:
   - Use that agent ID in your database
   - Or create your own agent in ElevenLabs dashboard

### Option 3: Create a New Agent in ElevenLabs

1. **Create Agent via ElevenLabs Dashboard**:
   - Go to ElevenLabs Conversational AI section
   - Click "Create New Agent"
   - Configure voice, personality, and settings
   - Copy the generated agent ID

2. **Update Your Avatar Creation Process**:
   - Modify the avatar creation to use ElevenLabs API
   - Automatically create agents when avatars are created
   - Store the returned agent ID in your database

## Quick Fix for Testing

**Immediate Solution**: Update your current avatar's agent ID in the database:

```sql
-- Replace with a working agent ID
UPDATE avatars 
SET agent_id = 'agent_1201kfk7960ffzt94m5jr0cfhqx4' 
WHERE agent_id = 'agent_4601kf84fzyze3wtk6s0v1p05rhp';
```

## Validation Tools Added

The integration now includes:

1. **Agent Validation**: Automatically checks if agent exists
2. **Better Error Messages**: Specific error for 404, 401, 403 responses
3. **Test Page**: `/simli-test` with agent validation
4. **Quick Test Agents**: Pre-configured working agent IDs

## Preventing Future Issues

1. **Validate Agent IDs**: Always validate agent IDs before storing in database
2. **Error Handling**: The integration now provides clear error messages
3. **Test First**: Use the test page to verify agent IDs work
4. **Keep Agents Synced**: Ensure database agent IDs match ElevenLabs dashboard

## Next Steps

1. **Fix Current Agent ID**: Update the database with a valid agent ID
2. **Test Connection**: Use the test page to verify it works
3. **Update Avatar Creation**: Ensure future avatars use valid agent IDs
4. **Monitor Errors**: Check console for any other connection issues

Once you update the agent ID in your database, the ElevenLabs connection should work perfectly with the Simli avatar!
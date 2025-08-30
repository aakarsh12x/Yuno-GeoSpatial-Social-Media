const bcrypt = require('bcrypt');
const { query, testConnection } = require('../database/connection');

const updateUserPassword = async () => {
  try {
    console.log('🔧 Updating user password...');
    await testConnection();
    
    // Hash the password "user"
    const hashedPassword = await bcrypt.hash('user', 10);
    
    // Update the user's password
    const updateQuery = `
      UPDATE users 
      SET password_hash = $1 
      WHERE email = 'user123@example.com'
    `;
    
    const result = await query(updateQuery, [hashedPassword]);
    
    if (result.rowCount > 0) {
      console.log('✅ Password updated successfully for user123@example.com');
      console.log('🔑 New credentials: user123@example.com / user');
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Failed to update password:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  updateUserPassword();
}

module.exports = { updateUserPassword };

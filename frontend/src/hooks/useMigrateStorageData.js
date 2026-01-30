import { useEffect } from 'react';
import { migrationApi } from '@/lib/api';

/**
 * Hook to migrate localStorage cart and wishlist data to database after successful login
 * Call this in your login/signup success handler
 */
export const useMigrateStorageData = () => {
  const migrate = async () => {
    try {
      // Migrate both cart and wishlist
      await migrationApi.migrateAll();
      console.log('Successfully migrated localStorage data to database');
    } catch (err) {
      console.error('Error during data migration:', err);
      // Don't throw - migration failure shouldn't break login flow
    }
  };

  return { migrate };
};

export default useMigrateStorageData;

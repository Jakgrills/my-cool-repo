import { CgPluginLib } from '@common-ground-dao/cg-plugin-lib';

export class RoleManager {
  private static instance: RoleManager;
  private cgLib: CgPluginLib;

  private constructor() {
    this.cgLib = CgPluginLib.getInstance();
  }

  public static getInstance(): RoleManager {
    if (!RoleManager.instance) {
      RoleManager.instance = new RoleManager();
    }
    return RoleManager.instance;
  }

  public async assignRole(userId: string): Promise<void> {
    try {
      const roleName = process.env.NEXT_PUBLIC_REWARD_ROLE_NAME;
      if (!roleName) {
        throw new Error('Role name not configured');
      }

      // Get community info to find role ID
      const communityInfo = await this.cgLib.getCommunityInfo();
      const role = communityInfo.data.roles.find(r => r.title === roleName);
      
      if (!role) {
        throw new Error(`Role "${roleName}" not found`);
      }

      // Assign the role (will work even if user already has it)
      await this.cgLib.giveRole(role.id, userId);
    } catch (error) {
      console.error('Failed to assign role:', error);
      throw error;
    }
  }
} 